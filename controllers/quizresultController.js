// controllers/quizController.js
import asyncHandler from "express-async-handler";
import QuizResult from "../models/QuizResult.js";
import User from "../models/User.js";

// SAVE RESULT
export const saveQuizResult = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("fullName email contactNumber");

  const result = await QuizResult.create({
    userId,
    fullName: user.fullName,
    email: user.email,
    contactNumber: user.contactNumber,
    score: req.body.score,
    percentage: req.body.percentage,
    attempted: req.body.attempted,
    totalMarks: req.body.totalMarks,
    answers: req.body.answers,
  });

  res.json({ message: "Saved", result });
});
