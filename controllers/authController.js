/**
 * ------------------------------------------------------------------
 * AUTH CONTROLLER
 * ------------------------------------------------------------------
 * Handles:
 * - User Registration (Email + Password)
 * - User Login (Email + Password)
 * - Google OAuth Login
 *
 * Design Principles:
 * - asyncHandler wraps all functions → errors bubble to global handler
 * - NO try/catch inside controllers
 * - Passwords hashed using bcrypt
 * - JWT tokens issued with 7-day validity
 * - Google OAuth implemented with OAuth2 code exchange
 * ------------------------------------------------------------------
 */

import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { oauth2Client } from "../utils/googleClient.js";

/* ------------------------------------------------------------------
   POST /api/auth/register
   - Standard user registration
------------------------------------------------------------------ */
export const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    fatherName,
    email,
    mobile,
    password,
    pincode,
    city,
    state,
    address1,
    address2,
    role,
  } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const existingMobile = await User.findOne({ mobile });
  if (existingMobile) {
    res.status(400);
    throw new Error("Mobile number already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    fatherName,
    email,
    mobile,
    password: hashedPassword,
    pincode,
    city,
    state,
    address1,
    address2,
    role: role || "user",
    isVerified: true, // OTP verified before register
    profileCompleted: true,  // all details provided at registration
  });

  res.status(201).json({
    message: "Registered Successfully",
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

/* ------------------------------------------------------------------
   POST /api/auth/login
   - Email + password authentication
------------------------------------------------------------------ */
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
    profileCompleted: user.profileCompleted,
    isVerified: user.isVerified,
  });
});

/* ------------------------------------------------------------------
   POST /api/auth/google
   - Google OAuth Login
   - Phone number collected separately if missing
------------------------------------------------------------------ */
export const googleAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400);
    throw new Error("Authorization code missing");
  }

  /* --------------------------------------------------------------
     Step 1: Exchange auth code for tokens
  -------------------------------------------------------------- */
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  /* --------------------------------------------------------------
     Step 2: Fetch Google profile
  -------------------------------------------------------------- */
  const googleUser = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
  );

  const { email, name, picture } = googleUser.data;

  if (!email) {
    res.status(400);
    throw new Error("Google account email not available");
  }

  /* --------------------------------------------------------------
     Step 3: Find or create local user
  -------------------------------------------------------------- */
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      fullName: name,
      email,
      image: picture,
      role: "user",
      isVerified: false, // phone not verified yet
    });
  }

  /* --------------------------------------------------------------
     Step 4: Issue JWT
  -------------------------------------------------------------- */
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  /* --------------------------------------------------------------
     Step 5: Inform frontend if phone is required
  -------------------------------------------------------------- */
  res.json({
    message: "Google login successful",
    token,
    role: user.role,
    phoneRequired: !user.mobile,
    profileCompleted: user.profileCompleted,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
  });
});

/* ------------------------------------------------------------------
   PUT /api/auth/complete-profile
------------------------------------------------------------------ */
export const completeProfile = asyncHandler(async (req, res) => {
  const { mobile, address1, city, state, pincode } = req.body;

  if (!mobile || !address1 || !city || !state || !pincode) {
    res.status(400);
    throw new Error("All profile fields are required");
  }

  // 🔥 FIX: Exclude current user from duplicate check
  const mobileExists = await User.findOne({
    mobile,
    _id: { $ne: req.user.id },
  });

  if (mobileExists) {
    res.status(400);
    throw new Error("This mobile number is already registered");
  }

  const user = await User.findById(req.user.id);

  user.mobile = mobile;
  user.address1 = address1;
  user.city = city;
  user.state = state;
  user.pincode = pincode;
  user.profileCompleted = true;
  user.isVerified = true;

  await user.save();

  res.json({
    message: "Profile completed successfully",
  });
});
