// // models/QuizResult.js
// import mongoose from "mongoose";

// const answerSchema = new mongoose.Schema({
//   questionId: Number,
//   selectedIndex: Number,
//   correctIndex: Number,
// });

// // ⭐ IMPORTANT: quizId added here
// const quizResultSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

//     quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },

//     score: { type: Number, required: true },
//     percentage: { type: Number, required: true },
//     totalMarks: { type: Number, required: true },
//     attempted: { type: Number, required: true },

//     answers: [answerSchema],
//   },
//   { timestamps: true }
// );

// export default mongoose.model("QuizResult", quizResultSchema);

// models/QuizResult.js
/**
 * QuizResult model
 * - Stores result of a single user's attempt for a specific quiz
 * - Keeps minimal denormalized references (userId, quizId)
 * - Stores answers array to allow re-evaluation or audit
 *
 * Important:
 *  - Use mongoose.models guard to prevent OverwriteModelError
 *  - quizId ref to "Quiz" is required so we can query results per quiz
 */

import mongoose from "mongoose";

// Schema for each question's recorded answer (for review)
const answerSchema = new mongoose.Schema({
  questionId: Number,      // index of the question in the quiz.questions array
  selectedIndex: Number,   // for MCQ/checkbox we could store index; depends on implementation
  correctIndex: Number,    // saved for quick reference (optional)
  // Note: You could store selectedValue and correctValue too if you prefer value-based checks.
});

// Quiz result main schema
const quizResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who attempted
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true }, // which quiz

    // Summary fields
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },

    // Detailed answers for auditing / review
    answers: [answerSchema],
  },
  { timestamps: true }
);

// Safe export (prevents model overwrite errors)
export default mongoose.models.QuizResult || mongoose.model("QuizResult", quizResultSchema);
