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

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ["mcq", "checkbox", "text"], required: true },
  options: { type: [String], default: [] },
  answer: { type: mongoose.Schema.Types.Mixed, required: true }
});

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    category: {
      type: String,
      enum: ["Entrance Test", "Scholarship Quiz", "Other"],
      required: true,
    },

    questions: [QuestionSchema],

    // ⭐ NEW FIELD
    isPublished: {
      type: Boolean,
      default: false, // Admin must publish manually to make quiz visible
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", QuizSchema);
