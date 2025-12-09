// controllers/authController.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --------------------------------------------------
// REGISTER USER
// --------------------------------------------------
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, fatherName, email, mobile, password, role } = req.body;

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

// --------------------------------------------------
// LOGIN USER
// --------------------------------------------------
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User not found");
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

// --------------------------------------------------
// ⭐ GOOGLE LOGIN CONTROLLER
// --------------------------------------------------
export const googleLogin = asyncHandler(async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!email || !googleId) {
    res.status(400);
    throw new Error("Invalid Google login data");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      fullName: name,
      fatherName: "",
      email,
      mobile: "",
      googleId,
      password: "",
      role: "user",
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Google login success",
    token,
    role: user.role,
  });
});

