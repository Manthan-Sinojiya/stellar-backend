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
 * - asyncHandler wraps all functions → throws bubble to global handler
 * - No try/catch blocks except external API calls
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
   - Validated by express-validator before reaching controller
------------------------------------------------------------------ */
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, fatherName, email, mobile, password, role } = req.body;

  // Check if email already registered
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  // Hash password securely
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user record
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

/* ------------------------------------------------------------------
   POST /api/auth/login
   - Authenticates user using email + password
   - Issues JWT token with 7-day expiry
------------------------------------------------------------------ */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Step 1: Validate user existence
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  // Step 2: Validate password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(400);
    throw new Error("Incorrect password");
  }

  // Step 3: Issue JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role }, // payload
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Login successful",
    token,
    role: user.role,
  });
});

/* ------------------------------------------------------------------
   POST /api/auth/google
   - Google OAuth Login
   - Receives "code" from frontend and exchanges it for tokens
   - Retrieves user Google profile via Google API
   - Auto-creates local user record if not already existing
------------------------------------------------------------------ */
export const googleAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;

  console.log("📥 CODE RECEIVED:", code);

  if (!code) {
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    /* --------------------------------------------------------------
       Step 1: Exchange authorization code → Google tokens
    -------------------------------------------------------------- */
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    /* --------------------------------------------------------------
       Step 2: Fetch Google Profile Info
    -------------------------------------------------------------- */
    const googleUser = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { email, name, picture } = googleUser.data;

    /* --------------------------------------------------------------
       Step 3: Check if user exists OR auto-create
    -------------------------------------------------------------- */
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        image: picture,
        role: "user",
      });
    }

    /* --------------------------------------------------------------
       Step 4: Issue JWT token for the Google-authenticated user
    -------------------------------------------------------------- */
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Google Login Successful",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ GOOGLE LOGIN ERROR:", err?.response?.data || err?.message || err);

    return res.status(500).json({
      message: "Google Authentication Failed",
      error: err?.response?.data || err?.message || "Unknown error",
    });
  }
});
