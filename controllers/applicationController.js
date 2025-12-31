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

export const saveEducation = async (req, res) => {
  const { level, percentage, cgpa, marksheetUrl } = req.body;

  if (!marksheetUrl)
    return res.status(400).json({ message: "Marksheet required" });

  const record = await Education.create({
    userId: req.user.id,
    level,
    percentage,
    cgpa,
    marksheetUrl,
  });

  // IMPORTANT: Update application progress so Step 2 shows as done
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step2Completed: true },
    { upsert: true }
  );
  
  res.json({ success: true, record });
};

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
// export const addCertification = asyncHandler(async (req, res) => {
//   await Certification.create({
//     ...req.body,
//     userId: req.user.id,
//   });

//   await ApplicationProgress.findOneAndUpdate(
//     { userId: req.user.id },
//     { step4Completed: true }
//   );

//   res.json({ success: true, message: "Certification added" });
// });

/* controllers/applicationController.js */

/* controllers/applicationController.js */

export const addCertification = asyncHandler(async (req, res) => {
  const { title, organisation, certificateType, issueDate, certificateUrl } = req.body;

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
// export const scheduleInterview = asyncHandler(async (req, res) => {
//   const { interviewDate } = req.body;

//   if (!interviewDate) {
//     res.status(400);
//     throw new Error("Interview date required");
//   }

//   await ApplicationProgress.findOneAndUpdate(
//     { userId: req.user.id },
//     {
//       interviewDate,
//       step5Completed: true,
//     }
//   );

//   res.json({
//     success: true,
//     message: "Interview scheduled successfully",
//   });
// });

export const scheduleInterview = asyncHandler(async (req, res) => {
  const { interviewDate } = req.body;

  if (!interviewDate) {
    res.status(400);
    throw new Error("Interview date required");
  }

  // 1. Update Progress
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step5Completed: true, interviewDate },
    { upsert: true }
  );

  // 2. Update or Create Application Record
  let application = await Application.findOne({ userId: req.user.id });
  if (!application) {
    application = await Application.create({
      userId: req.user.id,
      interviewDate,
    });
  } else {
    application.interviewDate = interviewDate;
    await application.save();
  }

  // 3. Generate PDF Buffer
  const user = await User.findById(req.user.id);
  const pdfBuffer = await generateApplicationPDF({
    ...user.toObject(),
    interviewDate,
    quizSummary: "Completed",
  });

  // 4. Stream Buffer to GridFS
  const bucket = req.app.locals.gridFSBucket;
  const uploadStream = bucket.openUploadStream(
    `application_${application._id}.pdf`,
    { contentType: 'application/pdf' }
  );

  uploadStream.end(pdfBuffer);

  uploadStream.on("finish", async () => {
    // 5. Link the GridFS File ID to the Application model
    application.pdfFileId = uploadStream.id;
    await application.save();

    res.json({
      success: true,
      applicationId: application._id,
    });
  });

  uploadStream.on("error", (err) => {
    res.status(500);
    throw new Error("PDF Storage Failed: " + err.message);
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


/* ------------------------------------------------
   GET APPLICATION PDF
------------------------------------------------- */

/* ------------------------------------------------------------------
   GET /api/application/progress
   Fetch step completion status
------------------------------------------------------------------ */
export const getProgress = asyncHandler(async (req, res) => {
  const progress =
    (await ApplicationProgress.findOne({ userId: req.user.id })) || {
      step1Completed: false,
      step2Completed: false,
      step3Completed: false,
      step4Completed: false,
      step5Completed: false,
    };

  res.json({ success: true, progress });
});

export const completeProfileStep = asyncHandler(async (req, res) => {
  const { 
    fatherMobile, 
    fatherHighestEducation, 
    fatherOccupation, 
    fatherIncome,
    motherName, 
    motherEducation, 
    motherOccupation,
    extracurriculars 
  } = req.body;

  // 1. Mandatory Validation for Parent Details
  if (!fatherMobile || !fatherHighestEducation || !fatherOccupation || (!fatherIncome && fatherIncome !== 0) ||
      !motherName || !motherEducation || !motherOccupation) {
    res.status(400);
    throw new Error("All parent details (including Father's Mobile) are compulsory.");
  }

  // 2. Update User Profile with the new parent/extra data
  await User.findByIdAndUpdate(req.user.id, {
    fatherMobile,
    fatherHighestEducation,
    fatherOccupation,
fatherIncome: fatherIncome.toString(), // Ensure it stores as String to match your Model    motherName,
    motherEducation,
    motherOccupation,
    extracurriculars 
  });

  // 3. Mark Step 1 as completed
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step1Completed: true },
    { upsert: true }
  );

  res.json({ 
    success: true, 
    message: "Profile and parent details validated successfully" 
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

