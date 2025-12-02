// export default router;

// routes/quizresultRoutes.js
// This file handles quiz-related API routes
// Uses: express-async-handler for automatic try/catch
// All errors → sent to global errorHandler middleware

import express from "express";
import asyncHandler from "express-async-handler"; // auto-wrap async routes
import { protect } from "../middleware/authMiddleware.js";
import { saveQuizResult } from "../controllers/quizresultController.js";
import QuizResult from "../models/QuizResult.js";
import { quizValidation } from "../validators/allValidations.js";
import { validate } from "../middleware/validationHandler.js";

const router = express.Router();

/* ============================================================
   POST /api/quizresult/submit
   ✔ User submits quiz result
   ✔ Protected route (JWT required)
   ✔ Controller already uses asyncHandler + throw error
   ============================================================ */
router.post("/submit", protect, quizValidation, validate, saveQuizResult);

/* ============================================================
   GET /api/quizresult/results
   ✔ Get all results (Admin panel)
   ✔ Auto error handling using express-async-handler
   ✔ throw new Error() → sent to errorHandler
   ============================================================ */

router.get(
  "/results",
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find()
      .populate("userId", "fullName email contactNumber")
      .sort({ createdAt: -1 });

    if (!results || results.length === 0) {
      res.status(404);
      throw new Error("No quiz results found");
    }

    const formatted = results.map((r) => ({
      id: r._id,
      fullName: r.userId?.fullName || "Unknown",
      email: r.userId?.email || "Unknown",
      contactNumber: r.userId?.contactNumber || "N/A",
      score: r.score,
      percentage: r.percentage,
      totalMarks: r.totalMarks,
      attempted: r.attempted,
      createdAt: r.createdAt,
    }));

    res.json({
      success: true,
      results: formatted,
    });
  })
);

router.put(
  "/results/:id",
  asyncHandler(async (req, res) => {
    const { score, percentage, attempted, totalMarks } = req.body;

    const updated = await QuizResult.findByIdAndUpdate(
      req.params.id,
      { score, percentage, attempted, totalMarks },
      { new: true }
    );

    if (!updated) {
      res.status(404);
      throw new Error("Quiz result not found");
    }

    res.json({ success: true, message: "Quiz updated", updated });
  })
);

router.delete(
  "/results/:id",
  asyncHandler(async (req, res) => {
    const removed = await QuizResult.findByIdAndDelete(req.params.id);

    if (!removed) {
      res.status(404);
      throw new Error("Quiz result not found");
    }

    res.json({ success: true, message: "Quiz deleted successfully" });
  })
);

export default router;
