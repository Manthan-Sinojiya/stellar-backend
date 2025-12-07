// models/Quiz.js
/**
 * Quiz model
 * - Stores quiz metadata (title, category, publish flag)
 * - Contains an array of questions (embedded subdocuments)
 *
 * Note: Use mongoose.models.ModelName || mongoose.model(...) pattern
 * to avoid OverwriteModelError when hot-reloading or running tests.
 */

import mongoose from "mongoose";

// Single question schema (embedded)
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true }, // question text
  type: { type: String, enum: ["mcq", "checkbox", "text"], required: true }, // type of question
  options: { type: [String], default: [] }, // for mcq/checkbox
  // answer stored as:
  // - string for "mcq" (option string)
  // - array of strings for "checkbox"
  // - string for "text"
  answer: { type: mongoose.Schema.Types.Mixed, required: true },
});

// Main Quiz schema
const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // quiz title
    category: {
      type: String,
      enum: ["Entrance Test", "Scholarship Quiz", "Other"],
      required: true,
    },

    // Publish flag:
    // - Admin sets this to true to make quiz visible to non-admin users
    // - Default false to prevent accidental exposure
    isPublished: { type: Boolean, default: false },

    // Embedded questions
    questions: [QuestionSchema],
  },
  { timestamps: true } // createdAt and updatedAt
);

// Exporting safely to prevent model overwrite in dev environment
export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
