// // controllers/otpController.js
// import asyncHandler from "express-async-handler";
// import User from "../models/User.js";
// import Otp from "../models/Otp.js";
// import { sendOtp } from "../services/msg91Service.js";
// import bcrypt from "bcryptjs";

// const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// // SEND OTP
// export const registerUser = asyncHandler(async (req, res) => {
//   const { mobile, email } = req.body;

//   const exists = await User.findOne({ $or: [{ mobile }, { email }] });
//   if (exists) {
//     res.status(400);
//     throw new Error("User already exists");
//   }

//   const otp = generateOtp();
//   await sendOtp(mobile, otp);

//   await Otp.findOneAndUpdate({ mobile }, { otp }, { upsert: true });

//   res.json({ message: "OTP sent successfully", mobile });
// });

// // VERIFY OTP & CREATE USER
// // export const verifyOtpAndCreate = asyncHandler(async (req, res) => {
// //   const { mobile, otp, userData } = req.body;

// //   const record = await Otp.findOne({ mobile });
// //   if (!record) {
// //     res.status(400);
// //     throw new Error("OTP expired or invalid");
// //   }

// //   if (record.otp !== otp) {
// //     res.status(400);
// //     throw new Error("Incorrect OTP");
// //   }

// //   const hashedPassword = await bcrypt.hash(userData.password, 10);

// //   await User.create({
// //     ...userData,
// //     password: hashedPassword,
// //     isVerified: true,
// //   });

// //   await Otp.deleteOne({ mobile });

// //   res.json({ message: "User registered successfully" });
// // });

// export const verifyOtpAndCreate = asyncHandler(async (req, res) => {
//   const { mobile, otp } = req.body;

//   const record = await Otp.findOne({ mobile });

//   if (!record) {
//     res.status(400);
//     throw new Error("OTP expired or invalid");
//   }

//   if (record.otp !== otp) {
//     res.status(400);
//     throw new Error("Incorrect OTP");
//   }

//   // OTP ok → mark mobile verified
//   await Otp.deleteOne({ mobile });

//   res.json({
//     success: true,
//     message: "OTP verified successfully!",
//   });
// });

// controllers/otpController.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendOtp } from "../services/msg91Service.js";
import bcrypt from "bcryptjs";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// SEND OTP
export const registerUser = asyncHandler(async (req, res) => {
  const { mobile, email } = req.body;

  const exists = await User.findOne({ $or: [{ mobile }, { email }] });
  if (exists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const otp = generateOtp();
  await sendOtp(mobile, otp);

  await Otp.findOneAndUpdate({ mobile }, { otp }, { upsert: true });

  res.json({ message: "OTP sent successfully", mobile });
});

// VERIFY OTP & CREATE USER
// export const verifyOtpAndCreate = asyncHandler(async (req, res) => {
//   const { mobile, otp, userData } = req.body;

//   const record = await Otp.findOne({ mobile });
//   if (!record) {
//     res.status(400);
//     throw new Error("OTP expired or invalid");
//   }

//   if (record.otp !== otp) {
//     res.status(400);
//     throw new Error("Incorrect OTP");
//   }

//   const hashedPassword = await bcrypt.hash(userData.password, 10);

//   await User.create({
//     ...userData,
//     password: hashedPassword,
//     isVerified: true,
//   });

//   await Otp.deleteOne({ mobile });

//   res.json({ message: "User registered successfully" });
// });

// export const verifyOtpAndCreate = asyncHandler(async (req, res) => {
//   const { mobile, otp } = req.body;

//   const record = await Otp.findOne({ mobile });

//   if (!record) {
//     res.status(400);
//     throw new Error("OTP expired or invalid");
//   }

//   if (record.otp !== otp) {
//     res.status(400);
//     throw new Error("Incorrect OTP");
//   }

//   // OTP ok → mark mobile verified
//   await Otp.deleteOne({ mobile });

//   res.json({
//     success: true,
//     message: "OTP verified successfully!",
//   });
// });

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

  await Otp.deleteOne({ mobile });

  res.json({
    success: true,
    message: "OTP verified successfully!",
  });
});
