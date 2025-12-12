/**
 * ------------------------------------------------------------------
 * USER CONTROLLER
 * ------------------------------------------------------------------
 * Handles:
 * - Retrieving all users (Admin interface)
 * - Creating users manually (Admin-side user creation)
 * - Updating user records
 * - Deleting users
 *
 * Notes:
 * - Authentication/authorization applied via middleware in routes
 * - Passwords are hashed before saving
 * - Errors are thrown (not returned) → handled by global error handler
 * ------------------------------------------------------------------
 */

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

/* ------------------------------------------------------------------
   GET /api/users
   - Returns a list of all users
   - Sorted newest → oldest
   - Typically used in admin dashboard
------------------------------------------------------------------ */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    users,
  });
});

/* ------------------------------------------------------------------
   POST /api/users
   - Admin-created user record
   - Used when admin manually registers a user from dashboard
------------------------------------------------------------------ */
export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Prevent duplicate user creation
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role,
  });

  res.json({
    success: true,
    user,
  });
});

/* ------------------------------------------------------------------
   PUT /api/users/:id
   - Update user profile data
   - Admin-only functionality (based on route protection)
------------------------------------------------------------------ */
export const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email, role } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { fullName, email, role },
    { new: true } // Return updated document
  );

  res.json({
    success: true,
    user,
  });
});

/* ------------------------------------------------------------------
   DELETE /api/users/:id
   - Deletes a user entirely
   - Admin-only
------------------------------------------------------------------ */
export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "User deleted",
  });
});
