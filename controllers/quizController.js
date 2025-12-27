/**
 * ------------------------------------------------------------------
 * QUIZ CONTROLLER
 * ------------------------------------------------------------------
 * Handles:
 * - Creating, updating, deleting quizzes (Admin-only)
 * - Listing quizzes with pagination, search, sort
 * - Viewing a single quiz with publish-rule enforcement
 * - Toggling publish/unpublish status
 *
 * Key Design Principles:
 * - Uses asyncHandler to bubble errors into global error handler
 * - Validates questions via helper function (validateQuestion)
 * - Admin restrictions enforced through auth middleware
 * - Students can only view published quizzes
 * ------------------------------------------------------------------
 */

import Quiz from "../models/Quiz.js";
import asyncHandler from "express-async-handler";

/* ------------------------------------------------------------------
   Helper: Validate a single question object
   - Ensures required fields based on question type
   - Throws Error on invalid structure
------------------------------------------------------------------ */
const validateQuestion = (q) => {
  if (!q || typeof q !== "object") throw new Error("Invalid question object");

  if (!q.question || !q.question.toString().trim())
    throw new Error("Question text is required");

  if (!["mcq", "checkbox", "text"].includes(q.type))
    throw new Error("Invalid question type");

  // MCQ & Checkbox require options
  if (q.type !== "text") {
    if (!Array.isArray(q.options) || q.options.length < 2)
      throw new Error("MCQ/Checkbox requires at least 2 options");
  }

  // MCQ requires a single correct answer
  if (q.type === "mcq") {
    if (!q.answer || typeof q.answer !== "string")
      throw new Error("MCQ requires a correct answer (string)");
    if (!q.options.includes(q.answer))
      throw new Error("MCQ answer must match one of the options");
  }

  // Checkbox requires array of answers
  if (q.type === "checkbox") {
    if (!Array.isArray(q.answer) || q.answer.length === 0)
      throw new Error("Checkbox type requires at least one correct answer");

    const invalid = q.answer.some((ans) => !q.options.includes(ans));
    if (invalid)
      throw new Error("One or more checkbox answers are not valid options");
  }

  // Text requires answer string
  if (q.type === "text") {
    if (!q.answer || !q.answer.toString().trim())
      throw new Error("Text question requires an answer string");
  }
};

/* ------------------------------------------------------------------
   GET /api/quiz
   - Lists quizzes with:
        • Pagination (page, limit)
        • Search (title/category)
        • Sorting (latest, oldest, A-Z, Z-A)
   - Admin sees all quizzes
   - Students see only published quizzes
------------------------------------------------------------------ */
export const getQuizzes = asyncHandler(async (req, res) => {
  let { page = 1, limit = 20, search = "", sort = "latest" } = req.query;
  page = Number(page);
  limit = Number(limit);

  const isAdmin = req.user?.role === "admin";

  // Build search query
  const query = {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ],
  };

  // Students only see published quizzes
  if (!isAdmin) query.isPublished = true;

  // Sorting map
  const sortOptions = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    az: { title: 1 },
    za: { title: -1 },
  };

  const quizzes = await Quiz.find(query)
    .sort(sortOptions[sort] || sortOptions.latest)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Quiz.countDocuments(query);

  res.json({
    success: true,
    page,
    pages: Math.ceil(total / limit),
    total,
    quizzes,
  });
});

/* ------------------------------------------------------------------
   GET /api/quiz/:id
   - Returns a single quiz
   - Students cannot view unpublished quizzes
   - Admin can view everything
------------------------------------------------------------------ */
export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const isAdmin = req.user?.role === "admin";

  // Block unpublished quizzes for students
  if (!isAdmin && !quiz.isPublished) {
    res.status(403);
    throw new Error("Quiz is not available");
  }

  res.json({ success: true, quiz });
});

/* ------------------------------------------------------------------
   POST /api/quiz
   - Creates a quiz (Admin-only)
   - Validates each question before saving
------------------------------------------------------------------ */
export const createQuiz = asyncHandler(async (req, res) => {
  const { title, category, questions, duration } = req.body;

  if (!title || !category || !questions?.length) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  // Validate each question
  questions.forEach(validateQuestion);

  const quiz = await Quiz.create({
    title,
    category,
    questions,
    duration: duration || 0,
  });

  res.status(201).json({
    success: true,
    quiz,
  });
});

/* ------------------------------------------------------------------
   PUT /api/quiz/:id
   - Update quiz details (Admin-only)
   - Validates updated questions before saving
------------------------------------------------------------------ */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const { title, category, questions, duration } = req.body;

  if (title) quiz.title = title;
  if (category) quiz.category = category;
  if (duration !== undefined) quiz.duration = duration; // Update duration
  if (Array.isArray(questions)) {
    questions.forEach(validateQuestion);
    quiz.questions = questions;
  }

  const updatedQuiz = await quiz.save();

  res.json({
    success: true,
    quiz: updatedQuiz,
  });
});

/* ------------------------------------------------------------------
   DELETE /api/quiz/:id
   - Deletes a quiz (Admin-only)
------------------------------------------------------------------ */
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  await quiz.deleteOne();

  res.json({
    success: true,
    message: "Quiz deleted",
  });
});

/* ------------------------------------------------------------------
   PATCH /api/quiz/:id/publish-toggle
   - Toggles quiz publish state (Admin-only)
   - Makes quiz available/unavailable to students
------------------------------------------------------------------ */
export const togglePublishQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // Toggle publish state
  quiz.isPublished = !quiz.isPublished;
  await quiz.save();

  res.json({
    success: true,
    message: quiz.isPublished ? "Quiz published" : "Quiz unpublished",
    quiz,
  });
});
