/**
 * ------------------------------------------------------------------
 * Quiz Result Model
 * ------------------------------------------------------------------
 * Responsibilities:
 * - Stores quiz attempt submitted by a student
 * - Keeps detailed comparison of correct answers vs submitted answers
 * - Allows admin review + re-evaluation in future
 *
 * answerSchema:
 * - Stores minimal per-question evaluation data
 * - Designed for audit trail and review screens
 *
 * quizResultSchema:
 * - Stores summary score + percentage
 * - userId → reference to User
 * - quizId → reference to Quiz
 *
 * Best Practices:
 * - Use mongoose.models guard for hot-reload safety
 * - answers[] allows detailed reconstruction for result pages
 * ------------------------------------------------------------------
 */

import mongoose from "mongoose";

// Embedded structure for each question's evaluated answer
const answerSchema = new mongoose.Schema({
  questionId: Number,      // index of question in quiz.questions
  selectedIndex: Number,   // student's choice (for MCQ / checkbox)
  correctIndex: Number,    // expected choice index
  // Can be extended later with selectedValue, correctValue, etc.
});

// Main quiz result schema
const quizResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },

    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },

    // Full answer breakdown
    answers: [answerSchema],
  },
  { timestamps: true }
);

export default mongoose.models.QuizResult ||
  mongoose.model("QuizResult", quizResultSchema);
