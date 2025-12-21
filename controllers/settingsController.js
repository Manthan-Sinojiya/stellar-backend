import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";

/* =====================================================
   UPDATE PASSWORD (Logged-in user)
   PUT /api/settings/update-password
===================================================== */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({
    success: true,
    message: "Password updated successfully",
  });
});

/* =====================================================
   SEND RESET OTP
   POST /api/settings/reset-password/send-otp
===================================================== */
export const sendResetPasswordOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    res.status(400);
    throw new Error("Mobile number is required");
  }

  const user = await User.findOne({ mobile });
  if (!user) {
    res.status(404);
    throw new Error("Mobile number not registered");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  user.resetOtp = hashedOtp;
  user.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  await user.save();

  // 🔔 Integrate SMS service here
  // await sendOtpSms(mobile, otp);

  console.log("RESET OTP (DEV ONLY):", otp);

  res.json({
    success: true,
    message: "OTP sent to registered mobile number",
  });
});

/* =====================================================
   VERIFY OTP & RESET PASSWORD
   POST /api/settings/reset-password/verify
===================================================== */
export const verifyOtpAndResetPassword = asyncHandler(async (req, res) => {
  const { mobile, otp, newPassword } = req.body;

  if (!mobile || !otp || !newPassword) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const user = await User.findOne({
    mobile,
    resetOtp: hashedOtp,
    resetOtpExpiry: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;

  await user.save();

  res.json({
    success: true,
    message: "Password reset successful",
  });
});
