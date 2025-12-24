import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Education from "../models/Education.js";
import Certification from "../models/Certification.js";
import ApplicationProgress from "../models/ApplicationProgress.js";
import Application from "../models/ApplicationSchema.js";

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

export const saveEducation = asyncHandler(async (req, res) => {
  const { level, percentage, cgpa } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("Marksheet file is required");
  }

  await Education.create({
    userId: req.user.id,
    level,
    percentage,
    cgpa,
    marksheetUrl: req.file.path,
  });

  const count = await Education.countDocuments({ userId: req.user.id });

  if (count >= 2) {
    await ApplicationProgress.updateOne(
      { userId: req.user.id },
      { step2Completed: true },
      { upsert: true }
    );
  }

  res.json({ success: true, message: "Education saved" });
});

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
export const addCertification = asyncHandler(async (req, res) => {
  await Certification.create({
    ...req.body,
    userId: req.user.id,
  });

  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step4Completed: true }
  );

  res.json({ success: true, message: "Certification added" });
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

//Final Submit API

export const scheduleInterview = asyncHandler(async (req, res) => {
  const { interviewDate } = req.body;

  if (!interviewDate) {
    res.status(400);
    throw new Error("Interview date required");
  }

  // Mark Step-5 completed
  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    {
      interviewDate,
      step5Completed: true,
    },
    { upsert: true }
  );

  // Create or update application
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

  res.json({
    success: true,
    applicationId: application._id, // ✅ REQUIRED BY FRONTEND
  });
});
