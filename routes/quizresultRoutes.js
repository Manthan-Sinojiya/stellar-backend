// routes/quizresultRoutes.js
/**
 * Quiz Result Routes
 * Includes:
 * - Submit quiz attempt (student)
 * - View own quiz result (student)
 * - View all results (admin)
 * - Update / delete results (admin)
 */

import express from "express";
import asyncHandler from "express-async-handler";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { submitQuizResult } from "../controllers/quizresultController.js";
import QuizResult from "../models/QuizResult.js";

const router = express.Router();

/**
 * 1️⃣ POST /submit
 * Student submits quiz → backend validates and saves
 */
router.post(
  "/submit",
  protect,
  asyncHandler(submitQuizResult) // fully evaluated here
);

/**
 * 2️⃣ GET /my/:quizId
 * Student fetches their own result for a specific quiz
 */
router.get(
  "/my/:quizId",
  protect,
  asyncHandler(async (req, res) => {
    const result = await QuizResult.findOne({
      userId: req.user.id,
      quizId: req.params.quizId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No result found for this quiz",
      });
    }

    res.json({ success: true, result });
  })
);

/**
 * 3️⃣ GET /my-results
 * Student fetches all their quiz attempts
 */
router.get(
  "/my-results",
  protect,
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, results });
  })
);

/**
 * 4️⃣ GET /results (Admin Only)
 * Admin sees all quiz attempts from all students
 */
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

/**
 * 5️⃣ PUT /results/:id (Admin Only)
 * Admin updates a quiz result manually
 */
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

/**
 * 6️⃣ DELETE /results/:id (Admin Only)
 * Admin deletes a quiz result
 */
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
