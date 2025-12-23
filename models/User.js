/**
 * ------------------------------------------------------------------
 * User Model
 * ------------------------------------------------------------------
 * Responsibilities:
 * - Stores user profile details
 * - Supports authentication (email/password or Google OAuth)
 * - Contains role-based access (admin/user)
 * - Includes verification flags for OTP registration system
 *
 * Notes:
 * - email + mobile fields marked unique for duplicate prevention
 * - Password is stored hashed (bcrypt)
 * - isVerified: true when OTP/email verification is completed
 * ------------------------------------------------------------------
 */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    fatherName: { type: String },

    // Unique identifiers
    email: { type: String, unique: true },
    mobile: { type: String, unique: true, sparse: true, },

    // Hashed password (bcrypt)
    password: { type: String },

    // Optional profile details
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    dob: {
      type: Date,
    },
    address1: String,
    address2: String,
    city: String,
    state: String,
    pincode: String,
    image: String,

    // OTP verification flag
    isVerified: { type: Boolean, default: false },

    // Reset password OTP
    resetOtp: String,
    resetOtpExpiry: Date,
    // Role-based permissions
    role: { type: String, enum: ["admin", "user"], default: "user" },
    profileCompleted: { type: Boolean, default: false }

  },
  { timestamps: true } // createdAt, updatedAt auto-generation
);

export default mongoose.model("User", userSchema);
