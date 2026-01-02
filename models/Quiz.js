/**
 * ------------------------------------------------------------------
 * Quiz Model
 * ------------------------------------------------------------------
 * Responsibilities:
 * - Stores quiz metadata (title, category, publish flag)
 * - Contains embedded questions
 *
 * Question Structure:
 * - question: question text
 * - type: "mcq" | "checkbox" | "text"
 * - options: required for mcq/checkbox; ignored for text
 * - answer:
 *     - mcq → String
 *     - checkbox → Array of strings
 *     - text → String
 *
 * Best Practices:
 * - Embedded schema ensures atomic quiz updates
 * - Published flag ensures only admin controls visibility
 * - mongoose.models guard prevents OverwriteModelError during hot reload
 * ------------------------------------------------------------------
 */

import mongoose from "mongoose";

// Embedded question schema
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ["mcq", "checkbox", "text"], required: true },
  options: { type: [String], default: [] }, // MCQ / checkbox options
  answer: { type: mongoose.Schema.Types.Mixed, required: true }, // flexible type
  set: { type: String, enum: ["A", "B", "C", "None"], default: "None" } // NEW FIELD
});

const SetSchema = new mongoose.Schema({
  setName: { type: String, required: true },
  questions: [QuestionSchema],
});

// Main quiz schema
const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    // Very controlled categories to avoid clutter
    category: {
      type: String,
      enum: ["Entrance Test", "Scholarship Quiz", "Other"],
      required: true,
    },

    // ADD THIS: duration in minutes (0 or null can mean no limit)
    duration: { type: Number, default: 0 },
    
    // Controls visibility to students
    isPublished: { type: Boolean, default: false },

    // Array of questions
    questions: [QuestionSchema],
    sets: [SetSchema],
  },
  { timestamps: true }
);

// Safe export to avoid OverwriteModelError
export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);