// models/Quiz.js
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
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", QuizSchema);
