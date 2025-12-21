/**
 * ------------------------------------------------------------------
 * QUIZ RESULT ROUTES
 * ------------------------------------------------------------------
 * Endpoints:
 * - POST /submit           → Submit quiz answers (Student)
 * - GET  /my/:quizId       → Fetch user's result for a quiz
 * - GET  /my-results       → Fetch all quiz attempts by user
 * - GET  /results          → Admin: view all quiz results
 * - PUT  /results/:id      → Admin: update quiz result
 * - DELETE /results/:id    → Admin: delete quiz result
 *
 * Notes:
 * - protect middleware ensures user identity
 * - adminOnly restricts management features
 * ------------------------------------------------------------------
 */

import express from "express";
import asyncHandler from "express-async-handler";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { submitQuizResult } from "../controllers/quizresultController.js";
import QuizResult from "../models/QuizResult.js";

const router = express.Router();

/* ------------------------------------------------------------------
   Submit Quiz Attempt → Evaluated in backend
------------------------------------------------------------------ */
router.post("/submit", protect, asyncHandler(submitQuizResult));

/* ------------------------------------------------------------------
   Fetch Specific Result for a Single Quiz (Own Attempts Only)
------------------------------------------------------------------ */
router.get(
  "/my/:quizId",
  protect,
  asyncHandler(async (req, res) => {
    const result = await QuizResult.findOne({
      userId: req.user.id,
      quizId: req.params.quizId,
    }).populate("quizId", "title category");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No result found for this quiz",
      });
    }

    res.json({ success: true, result });
  })
);

/* ------------------------------------------------------------------
   Fetch All Quiz Attempts of Logged-in User
------------------------------------------------------------------ */
router.get(
  "/my-results",
  protect,
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ userId: req.user.id })
      .populate("quizId", "title category")
      .sort({ createdAt: -1 });

    res.json({ success: true, results });
  })
);

/* ------------------------------------------------------------------
   Admin: View All Quiz Results
------------------------------------------------------------------ */
router.get(
  "/results",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find()
      .populate("userId", "fullName email mobile")
      .populate("quizId", "title category")
      .sort({ createdAt: -1 });

    res.json({ success: true, results });
  })
);

/* ------------------------------------------------------------------
   Admin: Update Quiz Result Manually
------------------------------------------------------------------ */
router.put(
  "/results/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const updated = await QuizResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, updated });
  })
);

/* ------------------------------------------------------------------
   Admin: Delete Quiz Result
------------------------------------------------------------------ */
router.delete(
  "/results/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await QuizResult.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Quiz result deleted" });
  })
);

export default router;
