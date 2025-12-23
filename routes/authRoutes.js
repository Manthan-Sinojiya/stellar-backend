/**
 * ------------------------------------------------------------------
 * AUTH ROUTES
 * ------------------------------------------------------------------
 * Endpoints:
 * - POST /register     → Create new user (email/password)
 * - POST /login        → Login with email/password
 * - POST /google       → Login using Google OAuth
 * - GET  /admin-dashboard → Protected admin-only example route
 * - GET  /user-dashboard  → Protected user dashboard check
 *
 * Notes:
 * - Input validation performed via express-validator
 * - Controllers throw errors → global error handler formats response
 * ------------------------------------------------------------------
 */

import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  completeProfile,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  registerValidation,
  loginValidation,
} from "../validators/allValidations.js";
import { validate } from "../middleware/validationHandler.js";

const router = express.Router();

/* ------------------------------------------------------------------
   User Registration (Email + Password)
   Validations:
   - Full name, father name, email, mobile, password, address fields
------------------------------------------------------------------ */
router.post("/register", registerValidation, validate, registerUser);

/* ------------------------------------------------------------------
   Standard Login
   Validations:
   - Email format
   - Password required
------------------------------------------------------------------ */
router.post("/login", loginValidation, validate, loginUser);

/* ------------------------------------------------------------------
   Google OAuth Login
   - Frontend sends OAuth "code"
   - Backend exchanges for Google profile + issues JWT
------------------------------------------------------------------ */
router.post("/google", googleAuth);

/* ------------------------------------------------------------------
   Google OAuth Login
   - Frontend sends OAuth "code"
   - Backend exchanges for Google profile + issues JWT
------------------------------------------------------------------ */
router.put("/complete-profile", protect, completeProfile);

/* ------------------------------------------------------------------
   Protected Admin Dashboard Check
   - Demonstrates protect + adminOnly middleware usage
------------------------------------------------------------------ */
router.get("/admin-dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin Dashboard Access Granted" });
});

/* ------------------------------------------------------------------
   Protected User Dashboard Check
   - Any logged-in user can access
------------------------------------------------------------------ */
router.get("/user-dashboard", protect, (req, res) => {
   if(!req.user.profileCompleted){
      res.status(400);
      throw new Error("Please complete your profile to access the Dashboard");
   }
  res.json({ message: "User Dashboard Access Granted" });
});

export default router;
