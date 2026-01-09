import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProfile,
  getProgress,
  createOrder, 
  verifyPayment,
  uploadEducationFile,
  saveEducation,
  getEducation,
  addCertification,
  scheduleInterview,
  completeProfileStep,
  completeAptitudeStep,
  updateProfile, // ✅ ADD
  getApplicationPDF,

} from "../controllers/applicationController.js";

const router = express.Router();

// STEP 1 – profile (read-only)
router.get("/profile", protect, getProfile);

// STEP 1 – mark profile completed
router.post("/profile/complete", protect, completeProfileStep);

router.put("/profile", protect, updateProfile);

// STEP PROGRESS
router.get("/progress", protect, getProgress);

// STEP 2 – education
router.post("/upload", protect, uploadEducationFile);
router.post("/education", protect, saveEducation);
router.get("/education", protect, getEducation);

// STEP 3 – payment
router.post("/payment/create-order", protect, createOrder);
router.post("/payment/verify", protect, verifyPayment);
router.route("/all").get(getAllPayments);

// STEP 4 – Aptitude (NEW)
router.post("/aptitude/complete", protect, completeAptitudeStep);

// STEP 5 – certification
router.post("/certification", protect, addCertification);

// STEP 6 – interview
router.post("/interview", protect, scheduleInterview);

router.get("/:id/pdf", protect, getApplicationPDF);

export default router;
