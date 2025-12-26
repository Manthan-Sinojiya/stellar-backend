import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadMarksheet } from "../middleware/uploadMiddleware.js";
import {
  getProfile,
  getProgress,
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
router.post(
  "/education",
  protect,
  uploadMarksheet.single("marksheet"),
  saveEducation
);
router.get("/education", protect, getEducation);

// STEP 3 – Aptitude (NEW)
router.post("/aptitude/complete", protect, completeAptitudeStep);

// STEP 4 – certification
// router.post("/certification", protect, addCertification);
router.post(
  "/certification",
  protect,
  uploadCertification.single("certificate"),
  addCertification
);
// STEP 5 – interview
router.post("/interview", protect, scheduleInterview);

router.get("/:id/pdf", protect, getApplicationPDF);

export default router;
