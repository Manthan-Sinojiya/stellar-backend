import express from "express";
import {
  updatePassword,
  sendResetPasswordOtp,
  verifyOtpAndResetPassword,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Logged-in password change
router.put("/update-password", protect, updatePassword);

// Forgot password (OTP)
router.post("/reset-password/send-otp", sendResetPasswordOtp);
router.post("/reset-password/verify", verifyOtpAndResetPassword);

export default router;
