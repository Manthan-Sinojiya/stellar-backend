import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Education from "../models/Education.js";
import Certification from "../models/Certification.js";
import ApplicationProgress from "../models/ApplicationProgress.js";
import Application from "../models/ApplicationSchema.js";
import { generateApplicationPDF } from "../utils/generateApplicationPDF.js";
import { getSignedUploadUrl } from "../utils/s3.js"; // Adjust path as needed
/* ------------------------------------------------------------------
   GET /api/application/profile
   Step-1: Fetch read-only user profile
------------------------------------------------------------------ */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ success: true, user });
});

/* ------------------------------------------------------------------
   POST /api/application/education
   Step-2: Save 10th / 12th education
------------------------------------------------------------------ */
export const uploadEducationFile = async (req, res) => {
  const { fileName, fileType, folder } = req.body;

  if (!fileName || !fileType)
    return res.status(400).json({ message: "Invalid file" });

  const { uploadUrl, fileUrl } = await getSignedUploadUrl({
    fileName,
    fileType,
    folder,
  });

  res.json({ uploadUrl, fileUrl });
};

export const saveEducation = asyncHandler(async (req, res) => {
  const { level, percentage, cgpa, marksheetUrl } = req.body;

  // 1. Basic Validation
  if (!marksheetUrl) {
    res.status(400);
    throw new Error("Marksheet URL is required");
  }

  // 2. Strict Score Validation (Backend Guard)
  if (percentage !== null && percentage !== undefined) {
    const pVal = parseFloat(percentage);
    if (pVal < 0 || pVal > 100) {
      res.status(400);
      throw new Error("Invalid Percentage: Must be between 0 and 100");
    }
  }

  if (cgpa !== null && cgpa !== undefined) {
    const cVal = parseFloat(cgpa);
    if (cVal < 0 || cVal > 10) {
      res.status(400);
      throw new Error("Invalid CGPA: Must be between 0 and 10");
    }
  }

  // 3. Create or Update existing level record for this user
  // Using findOneAndUpdate allows students to fix mistakes before final submission
  const record = await Education.findOneAndUpdate(
    { userId: req.user.id, level },
    {
      userId: req.user.id,
      level,
      percentage: percentage || null,
      cgpa: cgpa || null,
      marksheetUrl,
    },
    { upsert: true, new: true }
  );

  // 4. Update progress
  // Note: Usually, we check if both 10th AND 12th exist before setting true,
  // but here we mark it true to signal the step has been interacted with.
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step2Completed: true },
    { upsert: true }
  );

  res.json({ success: true, record });
});

/* --------------------------------------------------
   GET /api/applications/education
   Fetch saved education records
-------------------------------------------------- */
export const getEducation = async (req, res) => {
  const data = await Education.find({ userId: req.user.id });
  res.json({ educations: data });
};

/* ------------------------------------------------------------------
   POST /api/application/aptitude/complete
   Step-3: Mark aptitude completed
------------------------------------------------------------------ */
export const completeAptitudeStep = asyncHandler(async (req, res) => {
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step3Completed: true },
    { upsert: true }
  );

  res.json({
    success: true,
    message: "Aptitude step completed",
  });
});

/* ------------------------------------------------------------------
   POST /api/application/certification
   Step-4: Add certification
------------------------------------------------------------------ */
export const addCertification = asyncHandler(async (req, res) => {
  const { title, organisation, certificateType, issueDate, certificateUrl } =
    req.body;

  // 1. Validation
  if (!title || !certificateUrl) {
    res.status(400);
    throw new Error("Title and Certificate File are required");
  }

  // 2. Create the record in MongoDB
  const cert = await Certification.create({
    userId: req.user.id, // Ensure userId is passed from the protect middleware
    title,
    organisation,
    certificateType,
    issueDate,
    certificateUrl,
  });

  // 3. IMPORTANT: Update progress so the system knows this step is finished
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step4Completed: true },
    { upsert: true }
  );

  res.status(201).json({ success: true, cert });
});

// Fetch all saved certifications for the current user
export const getCertifications = asyncHandler(async (req, res) => {
  const certifications = await Certification.find({ userId: req.user.id });
  res.json({ success: true, certifications });
});

/* ------------------------------------------------------------------
   POST /api/application/interview
   Step-5: Schedule interview
------------------------------------------------------------------ */
export const scheduleInterview = asyncHandler(async (req, res) => {
  const { interviewDate } = req.body;
  const userId = req.user.id;

  // 1. Fetch all data for the PDF
  const user = await User.findById(userId).lean();
  const educations = await Education.find({ userId }).lean();
  const certifications = await Certification.find({ userId }).lean();

  const fullData = {
    ...user,
    interviewDate,
    educations,
    certifications,
  };

  // 2. Generate Buffer
  const pdfBuffer = await generateApplicationPDF(fullData);

  // 3. GridFS Storage
  const bucket = req.app.locals.gridFSBucket;

  // Cleanup old PDF if exists
  let application = await Application.findOne({ userId });
  if (application?.pdfFileId) {
    try {
      await bucket.delete(application.pdfFileId);
    } catch (e) {}
  }

  const uploadStream = bucket.openUploadStream(`app_${userId}.pdf`, {
    contentType: "application/pdf",
  });

  uploadStream.end(pdfBuffer);

  // Ensure database update happens AFTER stream finish
  uploadStream.on("finish", async () => {
    if (!application) {
      application = await Application.create({
        userId,
        interviewDate,
        pdfFileId: uploadStream.id,
      });
    } else {
      application.interviewDate = interviewDate;
      application.pdfFileId = uploadStream.id;
      await application.save();
    }

    // Mark step 5 complete
    await ApplicationProgress.findOneAndUpdate(
      { userId },
      { step5Completed: true },
      { upsert: true }
    );

    res.json({ success: true, applicationId: application._id });
  });
});

export const getApplicationPDF = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application || !application.pdfFileId) {
    res.status(404);
    throw new Error("PDF not found");
  }

  const bucket = req.app.locals.gridFSBucket;
  const stream = bucket.openDownloadStream(application.pdfFileId);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="application_${application._id}.pdf"`,
    "Cache-Control": "no-store",
  });

  stream.on("error", () => {
    res.status(500).end();
  });

  stream.pipe(res);
});

/* ------------------------------------------------------------------
   GET /api/application/progress
   Fetch step completion status
------------------------------------------------------------------ */
export const getProgress = asyncHandler(async (req, res) => {
  const progress = (await ApplicationProgress.findOne({
    userId: req.user.id,
  })) || {
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,
    step4Completed: false,
    step5Completed: false,
  };

  res.json({ success: true, progress });
});

/* ------------------------------------------------------------------
   POST /api/application/profile/complete
   Step-1: Finalize Parent Details and mark Step 1 complete
------------------------------------------------------------------ */
export const completeProfileStep = asyncHandler(async (req, res) => {
  const {
    fatherMobile,
    fatherHighestEducation,
    fatherOccupation,
    fatherIncome,
    motherName,
    motherEducation,
    motherOccupation,
    extracurriculars,
  } = req.body;

  // Helper to check for actual content
  const isValidString = (val) => val && String(val).trim().length > 0;

  // 1. Mandatory Validation for Parent Details
  if (
    !isValidString(fatherMobile) ||
    !isValidString(fatherHighestEducation) ||
    !isValidString(fatherOccupation) ||
    !isValidString(fatherIncome) ||
    !isValidString(motherName) ||
    !isValidString(motherEducation) ||
    !isValidString(motherOccupation)
  ) {
    res.status(400);
    throw new Error("All parent details are compulsory.");
  }

  // 2. Format Validation: Father's Mobile (Exactly 10 Digits)
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(fatherMobile)) {
    res.status(400);
    throw new Error("Father's mobile number must be a valid 10-digit number.");
  }

  // 3. Format Validation: Father's Income (Positive Number)
  const incomeNum = Number(fatherIncome);
  if (isNaN(incomeNum) || incomeNum < 0) {
    res.status(400);
    throw new Error("Annual income must be a valid positive number.");
  }

  // 4. Update User Profile with sanitized data
  await User.findByIdAndUpdate(req.user.id, {
    fatherMobile: fatherMobile.trim(),
    fatherHighestEducation: fatherHighestEducation.trim(),
    fatherOccupation: fatherOccupation.trim(),
    fatherIncome: incomeNum.toString(),
    motherName: motherName.trim(),
    motherEducation: motherEducation.trim(),
    motherOccupation: motherOccupation.trim(),
    extracurriculars: extracurriculars ? extracurriculars.trim() : null,
  });

  // 5. Mark Step 1 as completed in progress tracker
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step1Completed: true },
    { upsert: true }
  );

  res.json({
    success: true,
    message: "Profile validated and saved successfully",
  });
});

/* ------------------------------------------------------------------
   PUT /api/application/profile
   Step-1: Update editable profile fields
------------------------------------------------------------------ */
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    fullName,
    fatherName,
    gender,
    dob,
    pincode,
    city,
    address1,
    address2,
  } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Editable fields only
  user.fullName = fullName ?? user.fullName;
  user.fatherName = fatherName ?? user.fatherName;
  user.gender = gender ?? user.gender;
  user.dob = dob ?? user.dob;
  user.pincode = pincode ?? user.pincode;
  user.city = city ?? user.city;
  user.address1 = address1 ?? user.address1;
  user.address2 = address2 ?? user.address2;

  await user.save();

  // Mark step-1 completed
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step1Completed: true },
    { upsert: true }
  );

  res.json({
    success: true,
    message: "Profile updated successfully",
  });
});
