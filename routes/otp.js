/**
 * ------------------------------------------------------------------
 * OTP REGISTRATION ROUTES
 * ------------------------------------------------------------------
 * Endpoints:
 * - POST /register     → Send OTP to mobile
 * - POST /verify-otp   → Verify OTP + Create user
 *
 * Validation:
 * - otpSendValidation validates mobile/email
 * - otpVerifyValidation validates mobile, OTP, and nested userData
 * ------------------------------------------------------------------
 */

import express from "express";
import {
  registerUser,
  verifyOtpAndCreate,
} from "../controllers/otpController.js";
import {
  otpSendValidation,
  otpVerifyValidation,
} from "../validators/allValidations.js";
import { validate } from "../middleware/validationHandler.js";

const router = express.Router();

/* ------------------------------------------------------------------
   Send OTP to user mobile
------------------------------------------------------------------ */
router.post("/register", otpSendValidation, validate, registerUser);

/* ------------------------------------------------------------------
   Verify OTP & Create User Account
------------------------------------------------------------------ */
router.post("/verify-otp", otpVerifyValidation, validate, verifyOtpAndCreate);

export default router;
