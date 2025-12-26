import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Education from "../models/Education.js";
import Certification from "../models/Certification.js";
import ApplicationProgress from "../models/ApplicationProgress.js";
import Application from "../models/ApplicationSchema.js";
import { generateApplicationPDF } from "../utils/generateApplicationPDF.js";

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
// export const saveEducation = asyncHandler(async (req, res) => {
//   const { level, percentage, cgpa, marksheetUrl } = req.body;

//   if (!marksheetUrl) {
//     res.status(400);
//     throw new Error("Marksheet upload required");
//   }

//   await Education.create({
//     userId: req.user.id,
//     level,
//     percentage,
//     cgpa,
//     marksheetUrl,
//   });

//   const eduCount = await Education.countDocuments({
//     userId: req.user.id,
//   });

//   if (eduCount >= 2) {
//     await ApplicationProgress.findOneAndUpdate(
//       { userId: req.user.id },
//       { step2Completed: true }
//     );
//   }

//   res.json({ success: true, message: "Education saved" });
// });

export const uploadEducationFile = async (file) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("User not authenticated");
  }

  // 1️⃣ Request presigned URL
  const res = await fetch(
    "https://d1xgi380kxuazw.cloudfront.net/api/upload/presigned-url",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        folder: "education",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Presign failed: " + err);
  }

  const { uploadUrl, fileUrl } = await res.json();

  // 2️⃣ Upload to S3
  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!upload.ok) {
    throw new Error("S3 upload failed");
  }

  return fileUrl;
};



/* --------------------------------------------------
   GET /api/applications/education
   Fetch saved education records
-------------------------------------------------- */
export const getEducation = asyncHandler(async (req, res) => {
  const educations = await Education.find({
    userId: req.user.id,
  }).sort({ createdAt: 1 });

  res.json({
    success: true,
    educations,
  });
});

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

export const addCertification = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Certificate required" });

  const cert = await Certification.create({
    user: req.user._id,
    title: req.body.title,
    organisation: req.body.organisation,
    certificateUrl: `/uploads/certifications/${req.file.filename}`,
  });

  res.status(201).json(cert);
};

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
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step1Completed: true },
    { upsert: true }
  );

  res.json({ success: true });
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

