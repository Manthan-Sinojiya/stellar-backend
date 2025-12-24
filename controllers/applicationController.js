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

export const scheduleInterview = asyncHandler(async (req, res) => {
  const { interviewDate } = req.body;

  if (!interviewDate) {
    res.status(400);
    throw new Error("Interview date required");
  }

  await ApplicationProgress.findOneAndUpdate(
    { userId: req.user.id },
    { step5Completed: true, interviewDate },
    { upsert: true }
  );

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

  const user = await User.findById(req.user.id);

  const pdfBuffer = await generateApplicationPDF({
    ...user.toObject(),
    interviewDate,
    quizSummary: "Completed",
  });

  const bucket = req.app.locals.gridFSBucket;
  const uploadStream = bucket.openUploadStream(
    `application_${application._id}.pdf`
  );

  uploadStream.end(pdfBuffer);

  uploadStream.on("finish", async () => {
    application.pdfFileId = uploadStream.id;
    await application.save();

    res.json({
      success: true,
      applicationId: application._id,
    });
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
import PDFDocument from 'pdfkit';
import path from 'path';

export const generateApplicationPDF = async (req, res) => {
  const { applicationId } = req.params;
  const application = await Application.findById(applicationId).populate('userId');

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Response Headers
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  // --- PDF STYLING & UI ---

  // 1. HEADER WITH LOGO
  doc.rect(0, 0, 612, 120).fill('#0f172a'); // Dark Slate Background
  
  const logoPath = path.join(process.cwd(), 'public', 'favicon_io', 'logo.png');
  try {
    doc.image(logoPath, 50, 30, { width: 60 });
  } catch (e) {
    doc.fillColor('#ab45ff').fontSize(24).text('STELLAR', 50, 45);
  }

  doc.fillColor('#ffffff')
     .fontSize(20)
     .font('Helvetica-Bold')
     .text('APPLICATION SUMMARY', 130, 45, { characterSpacing: 2 });

  doc.fillColor('#94a3b8')
     .fontSize(8)
     .text(`ID: ${applicationId.toUpperCase()}`, 130, 70);

  // 2. TABLE GENERATOR FUNCTION
  const drawTableRow = (y, label, value, isHeader = false) => {
    if (isHeader) {
      doc.rect(50, y, 500, 25).fill('#ab45ff');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text(label, 65, y + 8);
    } else {
      doc.rect(50, y, 500, 30).fill('#f8fafc');
      doc.rect(50, y, 500, 30).stroke('#e2e8f0');
      doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(9).text(label.toUpperCase(), 65, y + 10);
      doc.fillColor('#1e293b').font('Helvetica').fontSize(10).text(value || 'NOT PROVIDED', 220, y + 10);
    }
  };

  // 3. RENDER DATA TABLE
  let currentY = 160;
  drawTableRow(currentY, 'PERSONAL CREDENTIALS', null, true);
  
  const data = [
    { label: 'Full Name', value: application.userId.name },
    { label: 'Father Name', value: application.userId.fatherName },
    { label: 'Email Address', value: application.userId.email },
    { label: 'Mobile Number', value: application.userId.mobile },
    { label: 'Residential City', value: application.userId.city },
    { label: 'Application Status', value: 'SUBMITTED' },
    { label: 'Scheduled Interview', value: application.interviewDate },
  ];

  data.forEach((item) => {
    currentY += 30;
    drawTableRow(currentY, item.label, item.value);
  });

  // 4. FOOTER
  doc.fontSize(8).fillColor('#94a3b8').text(
    'This is a system-generated encrypted document. © 2025 Stellar Institute of Technology',
    50, 780, { align: 'center' }
  );

  doc.end();
};
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

