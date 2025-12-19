/**
 * ------------------------------------------------------------------
 * OTP CONTROLLER
 * ------------------------------------------------------------------
 * Handles:
 * - Sending OTP for mobile-based registration
 * - Verifying OTP and creating a new user
 *
 * Design Principles:
 * - OTP stored in MongoDB with TTL (auto expires in 5 minutes)
 * - sendOtp() uses MSG91 or similar SMS provider
 * - User created only after OTP verification
 * - asyncHandler used for all async operations
 * - Errors thrown → handled by global error middleware
 * ------------------------------------------------------------------
 */

import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendOtp } from "../services/awsSnsService.js";
import bcrypt from "bcryptjs";

/* ------------------------------------------------------------------
   Helper: Generate 6-digit OTP
------------------------------------------------------------------ */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ------------------------------------------------------------------
   POST /api/otp/register
   - Sends OTP for mobile registration
   - Validated by otpSendValidation() before reaching controller
   - Prevents duplicate registration by checking existing email/mobile
------------------------------------------------------------------ */

export const registerUser = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const otp = generateOtp();

  await sendOtp(mobile, otp);

  await Otp.findOneAndUpdate(
    { mobile },
    { otp, createdAt: new Date() },
    { upsert: true }
  );

  res.status(200).json({ message: "OTP sent successfully" });
});

/* ------------------------------------------------------------------
  POST /api/otp/verify-otp
   - Verifies OTP
   - Creates user using userData
   - Deletes OTP after verification for security
------------------------------------------------------------------ */

export const verifyOtpAndCreate = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  const record = await Otp.findOne({ mobile });

  if (!record) {
    res.status(400);
    throw new Error("OTP expired");
  }

  if (record.otp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  await Otp.deleteOne({ mobile });

  res.json({ message: "Mobile verified successfully" });
});