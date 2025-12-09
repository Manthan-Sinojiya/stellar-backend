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
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Traditional auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth entry
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // req.user comes from passport verify callback
    const { token, user } = req.user || {};
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";

    // redirect to frontend and pass token & role as query params
    return res.redirect(`${frontend}/#/oauth-success?token=${token}&role=${user?.role}`);
  }
);

export default router;
