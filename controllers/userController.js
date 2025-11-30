import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

/* ---------------------------------------------------------
   GET ALL USERS
--------------------------------------------------------- */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

/* ---------------------------------------------------------
   CREATE USER
--------------------------------------------------------- */
export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const existing = await User.findOne({ email });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role,
  });

  res.json({ success: true, user });
});

/* ---------------------------------------------------------
   UPDATE USER
--------------------------------------------------------- */
export const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email, role } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { fullName, email, role },
    { new: true }
  );

  res.json({ success: true, user });
});

/* ---------------------------------------------------------
   DELETE USER
--------------------------------------------------------- */
export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "User deleted",
  });
});
