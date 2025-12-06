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

import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: Number,
  selectedIndex: Number,
  correctIndex: Number,
});

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    score: Number,
    percentage: Number,
    totalMarks: Number,
    attempted: Number,
    answers: [answerSchema],
  },
  { timestamps: true }
);

// ✅ FIX: model name must be "QuizResult", NOT "Quiz"
export default mongoose.models.QuizResult ||
  mongoose.model("QuizResult", quizResultSchema);
