// routes/quizresultRoutes.js
/**
 * QuizResult API
 * - Submit result (students)
 * - Admin: list all results / edit / delete
 * - Students: view their own results
 *
 * All endpoints are protected except where noted.
 */

import express from "express";
import asyncHandler from "express-async-handler";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { saveQuizResult } from "../controllers/quizresultController.js";
import QuizResult from "../models/QuizResult.js";
import { quizValidation } from "../validators/allValidations.js";
import { validate } from "../middleware/validationHandler.js"; // your validation handler wrapper

const router = express.Router();

// 1) Student submits result
router.post("/submit", protect, quizValidation, validate, saveQuizResult);

// 2) Admin: get all results (adminOnly to ensure only staff can access student data)
router.get(
  "/results",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find()
      .populate("userId", "fullName email mobile") // populate user minimal info
      .populate("quizId", "title category") // optional: include quiz title
      .sort({ createdAt: -1 });

    if (!results || results.length === 0) {
      res.status(404);
      throw new Error("No quiz results found");
    }

    res.json({ success: true, results });
  })
);

// 3) Student: get their result for a specific quiz
router.get(
  "/my/:quizId",
  protect,
  asyncHandler(async (req, res) => {
    const result = await QuizResult.findOne({
      userId: req.user.id,
      quizId: req.params.quizId,
    });

    if (!result) {
      res.status(404);
      throw new Error("No quiz result found for this quiz");
    }

    res.json({ success: true, result });
  })
);

// 4) Student: list all their attempts
router.get(
  "/my-results",
  protect,
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ userId: req.user.id }).sort({ createdAt: -1 });

    if (!results || results.length === 0) {
      res.status(404);
      throw new Error("You have not attempted any quizzes yet");
    }

    res.json({ success: true, results });
  })
);

// 5) Admin: update a result (rare but sometimes needed)
router.put(
  "/results/:id",
  protect,
  adminOnly,
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

    res.json({ success: true, message: "Quiz result updated", updated });
  })
);

// 6) Admin: delete a result
router.delete(
  "/results/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const removed = await QuizResult.findByIdAndDelete(req.params.id);
    if (!removed) {
      res.status(404);
      throw new Error("Quiz result not found");
    }
    res.json({ success: true, message: "Quiz result deleted" });
  })
);

export default router;
