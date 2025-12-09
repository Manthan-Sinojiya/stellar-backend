// import express from "express";
// import { registerUser, loginUser } from "../controllers/authController.js";
// import { protect, adminOnly } from "../middleware/authMiddleware.js";
// import { registerValidation, loginValidation } from "../validators/allValidations.js";
// import { validate } from "../middleware/validationHandler.js";

// const router = express.Router();

// router.post("/register", registerValidation, validate, registerUser);
// router.post("/login", loginValidation, validate, loginUser);

// router.get("/admin-dashboard", protect, adminOnly, (req, res) => {
//   res.json({ message: "Admin Dashboard Access Granted" });
// });

// router.get("/user-dashboard", protect, (req, res) => {
//   res.json({ message: "User Dashboard Access Granted" });
// });

// export default router;

import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// STEP 1 - Redirect user to Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// STEP 2 - Google redirects back
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/#/login" }),
  (req, res) => {

    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`http://localhost:5173/#/google-success?token=${token}`);
  }
);


export default router;
