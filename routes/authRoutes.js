import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { registerValidation, loginValidation } from "../validators/allValidations.js";
import { validate } from "../middleware/validationHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import admin from "../config/firebaseAdmin.js";
const router = express.Router();

router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginValidation, validate, loginUser);

router.get("/admin-dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin Dashboard Access Granted" });
});

router.get("/user-dashboard", protect, (req, res) => {
  res.json({ message: "User Dashboard Access Granted" });
});

router.post("/firebase-google-login", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) return res.status(400).json({ message: "Token missing" });

    // VERIFY ID TOKEN USING FIREBASE ADMIN
    const decoded = await admin.auth().verifyIdToken(idToken);

    const { email, name, picture, uid } = decoded;

    let user = await User.findOne({ email });

    // CREATE USER IF NOT EXIST
    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        password: "", // Google login → no password
        isVerified: true,
        role: "user",
      });
    }

    // GENERATE YOUR CUSTOM JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google Login Success",
      token,
      role: user.role,
    });

  } catch (err) {
    console.error("Firebase error:", err);
    res.status(401).json({ message: "Invalid Google Token" });
  }
});

export default router;
