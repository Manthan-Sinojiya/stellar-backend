import express from "express";
import {
  sendResetPasswordOtp,
  verifyOtpAndResetPassword,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Forgot password (OTP)
router.post("/reset-password/send-otp", sendResetPasswordOtp);
router.post("/reset-password/verify", verifyOtpAndResetPassword);

export default router;
