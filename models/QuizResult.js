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

    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    attempted: { type: Number, required: true },

    answers: [answerSchema],
  },
  { timestamps: true }
);

export default mongoose.model("QuizResult", quizResultSchema);
