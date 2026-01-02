/**
 * ------------------------------------------------------------------
 * QUIZ RESULT MODEL
 * ------------------------------------------------------------------
 * Responsibilities:
 * - Stores a single quiz attempt by a student
 * - Locks the assigned question set
 * - Stores detailed per-question evaluation
 * - Enables admin review, analytics, and re-evaluation
 *
 * Design Notes:
 * - One document = one attempt per user per quiz
 * - answers[] keeps an audit trail
 * - assignedSetName ensures deterministic evaluation
 * ------------------------------------------------------------------
 */

import mongoose from "mongoose";

/* ---------------- PER-QUESTION ANSWER SCHEMA ---------------- */
const AnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: Number,
      required: true, // index in set.questions
    },

    question: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["mcq", "checkbox", "text"],
      required: true,
    },

    /* ---------- MCQ ---------- */
    correctIndex: Number,
    userIndex: Number,

    /* ---------- CHECKBOX ---------- */
    correctAnswers: [String],
    userAnswers: [String],

    /* ---------- TEXT ---------- */
    correctText: String,
    userText: String,

    /* ---------- FINAL ---------- */
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false } // prevent extra _id for subdocs
);

/* ---------------- MAIN QUIZ RESULT SCHEMA ---------------- */
const QuizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    /* 🔒 LOCKED SET */
    assignedSetName: {
      type: String,
      required: true,
    },

    /* ---------- SCORE SUMMARY ---------- */
    score: {
      type: Number,
      required: true,
    },

    totalMarks: {
      type: Number,
      required: true,
    },

    attempted: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    /* ---------- DETAILED ANSWERS ---------- */
    answers: {
      type: [AnswerSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ---------------- PREVENT MULTIPLE ATTEMPTS ---------------- */
QuizResultSchema.index({ userId: 1, quizId: 1 }, { unique: true });

/* ---------------- SAFE EXPORT ---------------- */
export default mongoose.models.QuizResult ||
  mongoose.model("QuizResult", QuizResultSchema);
