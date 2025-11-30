// export default router;

// routes/quizRoutes.js
// This file handles quiz-related API routes
// Uses: express-async-handler for automatic try/catch
// All errors → sent to global errorHandler middleware

import express from "express";
import asyncHandler from "express-async-handler"; // auto-wrap async routes
import { protect } from "../middleware/authMiddleware.js";
import { saveQuizResult } from "../controllers/quizController.js";
import QuizResult from "../models/QuizResult.js";
import { quizValidation } from "../validators/allValidations.js";
import { validate } from "../middleware/validationHandler.js";

const router = express.Router();

/* ============================================================
   POST /api/quiz/submit
   ✔ User submits quiz result
   ✔ Protected route (JWT required)
   ✔ Controller already uses asyncHandler + throw error
   ============================================================ */
router.post("/submit", protect, quizValidation, validate, saveQuizResult);

/* ============================================================
   GET /api/quiz/results
   ✔ Get all results (Admin panel)
   ✔ Auto error handling using express-async-handler
   ✔ throw new Error() → sent to errorHandler
   ============================================================ */
router.get(
  "/results",
  asyncHandler(async (req, res) => {
    // Fetch quiz results from database
    const results = await QuizResult.find()
      .populate("userId", "fullName email") // Join fullName + email
      .sort({ createdAt: -1 });

    // If no results found → throw error
    if (!results || results.length === 0) {
      res.status(404);
      throw new Error("No quiz results found");
    }

    // Format results in user-friendly output
    const formatted = results.map((r) => ({
      fullName: r.userId?.fullName || "Unknown",
      email: r.userId?.email || "Unknown",
      score: r.score,
      percentage: r.percentage,
      totalMarks: r.totalMarks,
      attempted: r.attempted,
      createdAt: r.createdAt,
    }));

    // Successful response
    res.json({
      success: true,
      results: formatted,
    });
  })
);

export default router;
