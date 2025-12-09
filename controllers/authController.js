// // controllers/authController.js
// import asyncHandler from "express-async-handler";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// // REGISTER USER
// export const registerUser = asyncHandler(async (req, res) => {
//   const { fullName, fatherName, email, mobile, password, role } = req.body;

//   const exists = await User.findOne({ email });
//   if (exists) {
//     res.status(400);
//     throw new Error("Email already registered");
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const user = await User.create({
//     fullName,
//     fatherName,
//     email,
//     mobile,
//     password: hashedPassword,
//     role: role || "user",
//   });

//   res.json({ message: "Registered Successfully", user });
// });

// // LOGIN USER
// export const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
  
//   if (!user) {
//     res.status(400);
//     throw new Error("User not found");
//   }

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) {
//     res.status(400);
//     throw new Error("Incorrect password");
//   }

//   const token = jwt.sign(
//     { id: user._id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );

//   res.json({
//     message: "Login successful",
//     token,
//     role: user.role,
//   });
// });

import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, fatherName, email, mobile, password, role } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    fatherName,
    email,
    mobile,
    password: hashedPassword,
    role: role || "user",
  });

  res.json({ message: "Registered Successfully", user });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  // If account created via Google (no password)
  if (!user.password) {
    res.status(400);
    throw new Error("Use Google Login for this account");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(400);
    throw new Error("Incorrect password");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Login successful",
    token,
    role: user.role,
  });
});
