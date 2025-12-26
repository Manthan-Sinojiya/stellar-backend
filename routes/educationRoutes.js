import express from "express";
import {
  uploadEducationFile,
  saveEducation,
  getEducation,
} from "../controllers/educationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", protect, uploadEducationFile);
router.post("/", protect, saveEducation);
router.get("/", protect, getEducation);

export default router;
