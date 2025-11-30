import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { registerValidation, loginValidation } from "../validators/allValidations.js";
import { validate } from "../middleware/validationHandler.js";

const router = express.Router();

router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginValidation, validate, loginUser);

router.get("/admin-dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin Dashboard Access Granted" });
});

router.get("/user-dashboard", protect, (req, res) => {
  res.json({ message: "User Dashboard Access Granted" });
});

export default router;
