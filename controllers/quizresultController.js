// controllers/quizresultController.js
/**
 * Handles saving quiz results and basic result-related operations
 * - saveQuizResult: stores a student's attempt
 *
 * Important:
 * - This controller expects req.user to exist (protect middleware)
 * - We store userId + quizId + summary fields + answers
 * - No sensitive information from user is stored here
 */

import asyncHandler from "express-async-handler";
import QuizResult from "../models/QuizResult.js";

// POST /api/quizresult/submit
export const saveQuizResult = asyncHandler(async (req, res) => {
  // req.user is injected by protect middleware
  const userId = req.user?.id;
  if (!userId) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  // Validate required payload (simple checks; more validation can be added)
  const { quizId, score, percentage, attempted, totalMarks, answers } = req.body;
  if (!quizId) {
    res.status(400);
    throw new Error("quizId is required");
  }

  // Create result document
  const result = await QuizResult.create({
    userId,
    quizId,
    score,
    percentage,
    attempted,
    totalMarks,
    answers,
  });

  res.json({ success: true, message: "Saved", result });
});
