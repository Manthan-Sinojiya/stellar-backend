// /**
//  * ------------------------------------------------------------------
//  * OTP CONTROLLER
//  * ------------------------------------------------------------------
//  * Handles:
//  * - Sending OTP for mobile-based registration
//  * - Verifying OTP and creating a new user
//  *
//  * Design Principles:
//  * - OTP stored in MongoDB with TTL (auto expires in 5 minutes)
//  * - sendOtp() uses MSG91 or similar SMS provider
//  * - User created only after OTP verification
//  * - asyncHandler used for all async operations
//  * - Errors thrown → handled by global error middleware
//  * ------------------------------------------------------------------
//  */

// import asyncHandler from "express-async-handler";
// import User from "../models/User.js";
// import Otp from "../models/Otp.js";
// import { sendOtp } from "../services/msg91Service.js";
// import bcrypt from "bcryptjs";

// /* ------------------------------------------------------------------
//    Helper: Generate 6-digit OTP
// ------------------------------------------------------------------ */
// const generateOtp = () =>
//   Math.floor(100000 + Math.random() * 900000).toString();

// /* ------------------------------------------------------------------
//    POST /api/otp/register
//    - Sends OTP for mobile registration
//    - Validated by otpSendValidation() before reaching controller
//    - Prevents duplicate registration by checking existing email/mobile
// ------------------------------------------------------------------ */
// export const registerUser = asyncHandler(async (req, res) => {
//   const { mobile, email } = req.body;

//   // Prevent duplicate users via mobile or email
//   const exists = await User.findOne({ $or: [{ mobile }, { email }] });

//   if (exists) {
//     res.status(400);
//     throw new Error("User already exists");
//   }

//   // Generate and send OTP
//   const otp = generateOtp();
//   await sendOtp(mobile, otp);

//   // Save OTP (upsert = update if exists or create new)
//   await Otp.findOneAndUpdate(
//     { mobile },
//     { otp },
//     { upsert: true, new: true }
//   );

//   res.json({
//     message: "OTP sent successfully",
//     mobile,
//   });
// });

// /* ------------------------------------------------------------------
//    POST /api/otp/verify-otp
//    - Verifies OTP
//    - Creates user with userData (nested object)
//    - Deletes OTP after verification for security
// ------------------------------------------------------------------ */
// export const verifyOtpAndCreate = asyncHandler(async (req, res) => {
//   const { mobile, otp, userData } = req.body;

//   // Find OTP record
//   const record = await Otp.findOne({ mobile });

//   if (!record) {
//     res.status(400);
//     throw new Error("OTP expired or invalid");
//   }

//   // Validate OTP match
//   if (record.otp !== otp) {
//     res.status(400);
//     throw new Error("Incorrect OTP");
//   }

//   /* --------------------------------------------------------------
//      OTP Verified → Create user
//   -------------------------------------------------------------- */
//   const hashedPassword = await bcrypt.hash(userData.password, 10);

//   await User.create({
//     ...userData,
//     mobile,
//     password: hashedPassword,
//     isVerified: true, // Mark mobile verification done
//   });

//   // Remove OTP record after success
//   await Otp.deleteOne({ mobile });

//   res.json({
//     message: "User registered successfully",
//   });
// });


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
import { sendOtp } from "../services/msg91Service.js";
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
  const { mobile, email } = req.body;

  // Prevent duplicate users via mobile or email
  const exists = await User.findOne({ $or: [{ mobile }, { email }] });

  if (exists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Generate and send OTP
  const otp = generateOtp();
  await sendOtp(mobile, otp);

  // Save OTP (upsert = update if exists or create new)
  await Otp.findOneAndUpdate(
    { mobile },
    { otp },
    { upsert: true, new: true }
  );

  res.json({
    message: "OTP sent successfully",
    mobile,
  });
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
    throw new Error("OTP expired or invalid");
  }

  if (record.otp !== otp) {
    res.status(400);
    throw new Error("Incorrect OTP");
  }

  // OTP verified — delete record
  await Otp.deleteOne({ mobile });

  res.json({
    message: "Mobile verified successfully",
  });
});
