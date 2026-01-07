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
import Education from "../models/Education.js";
import Certification from "../models/Certification.js";
import QuizResult from "../models/QuizResult.js";
import ApplicationProgress from "../models/ApplicationProgress.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { sendPaymentSuccessEmail } from "../utils/sendPaymentEmail.js";

/* ------------------------------------------------------------------
   GET /api/users
   - Returns a list of all users
   - Sorted newest → oldest
   - Typically used in admin dashboard
------------------------------------------------------------------ */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "educations", // Must match the collection name in MongoDB
        localField: "_id",
        foreignField: "userId",
        as: "educationData" // This creates the array used in your frontend getEdu function
      }
    },
    {
      $lookup: {
        from: "quizresults",
        localField: "_id",
        foreignField: "userId",
        as: "quizResults"
      }
    },
    {
      $lookup: {
        from: "certifications",
        localField: "_id",
        foreignField: "userId",
        as: "certifications"
      }
    },
    {
      $lookup: {
        from: "applicationprogresses",
        localField: "_id",
        foreignField: "userId",
        as: "progress"
      }
    }
  ]);

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
    mobile,
  });

  try {
    await sendPaymentSuccessEmail(user);
  } catch (emailError) {
    console.error("Email failed to send:", emailError);
    // We don't throw error here so the user creation still succeeds 
    // but you might want to log it.
  }

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
  const { 
    fullName, 
    email, 
    role, 
    fatherName, 
    mobile, 
    address1, 
    city, 
    state, 
    pincode 
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { 
      fullName, 
      email, 
      role, 
      fatherName, 
      mobile, 
      address1, 
      city, 
      state, 
      pincode 
    }, 
    { new: true, runValidators: true } // Return updated document and validate
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

export const sendManualEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    await sendPaymentSuccessEmail(user);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Manual Email Error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});