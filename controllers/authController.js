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
import axios from "axios";
import { oauth2Client } from "../utils/googleClient.js";

// ---------------- REGISTER ----------------
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

// ---------------- LOGIN ----------------
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

// // ---------------- GOOGLE LOGIN ----------------
// export const googleAuth = asyncHandler(async (req, res) => {
//   const { code } = req.body;

//   if (!code) {
//     return res.status(400).json({ message: "Authorization code missing" });
//   }

//   try {
//     // STEP 1: Exchange CODE for tokens
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     // STEP 2: Get Google Profile
//     const googleUser = await axios.get(
//       `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
//     );

//     const { email, name, picture } = googleUser.data;

//     // STEP 3: Check if user exists
//     let user = await User.findOne({ email });

//     // STEP 4: Create if not exists
//     if (!user) {
//       user = await User.create({
//         fullName: name,
//         email,
//         image: picture,
//         role: "user",
//       });
//     }

//     // STEP 5: Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.json({
//       message: "Google Login Successful",
//       token,
//       user,
//     });
//   } catch (err) {
//     console.error("GOOGLE LOGIN ERROR:", err.response?.data || err);
//     res.status(500).json({
//       message: "Google Authentication Failed",
//       error: err.message,
//     });
//   }
// });

// ---------------- GOOGLE LOGIN ----------------
export const googleAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;

  console.log("📥 CODE RECEIVED:", code);

  if (!code) {
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    // EXCHANGE CODE → TOKENS
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // GET USER INFO
    const googleUser = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { email, name, picture } = googleUser.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        image: picture,
        role: "user",
      });
    }

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
      error: err?.response?.data || err?.message || "Unknown error"
    });
  }
});
