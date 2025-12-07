// controllers/quizController.js
/**
 * Quiz controllers
 * - Uses express-async-handler to bubble up thrown errors to global error handler
 * - All validation throws Error (no return/res.send inside validation)
 * - getQuizzes supports pagination, search, sort, and enforces publish filter for non-admins
 */

import Quiz from "../models/Quiz.js";
import asyncHandler from "express-async-handler";

/**
 * Helper: Validate a single question object.
 * Throws Error on invalid input.
 */
const validateQuestion = (q) => {
  if (!q || typeof q !== "object") throw new Error("Invalid question object");
  if (!q.question || !q.question.toString().trim()) throw new Error("Question text is required");

  if (!["mcq", "checkbox", "text"].includes(q.type)) throw new Error("Invalid question type");

  if (q.type !== "text") {
    if (!Array.isArray(q.options) || q.options.length < 2)
      throw new Error("MCQ/Checkbox requires at least 2 options");
  }

  if (q.type === "mcq") {
    if (!q.answer || typeof q.answer !== "string") throw new Error("MCQ requires a correct answer (string)");
    if (!q.options.includes(q.answer)) throw new Error("MCQ answer must match one of the options");
  }

  if (q.type === "checkbox") {
    if (!Array.isArray(q.answer) || q.answer.length === 0)
      throw new Error("Checkbox type requires at least one correct answer");
    const invalid = q.answer.some((ans) => !q.options.includes(ans));
    if (invalid) throw new Error("One or more checkbox answers are not valid options");
  }

  if (q.type === "text") {
    if (!q.answer || !q.answer.toString().trim()) throw new Error("Text question requires an answer string");
  }
};

/* ------------------------------------------------------------------
   GET /api/quiz
   - Admin: sees all quizzes
   - Student: sees only published quizzes
   - Supports: page, limit, search, sort
   ------------------------------------------------------------------ */
export const getQuizzes = asyncHandler(async (req, res) => {
  let { page = 1, limit = 20, search = "", sort = "latest" } = req.query;
  page = Number(page);
  limit = Number(limit);

  // Determine role from req.user if route protected
  const isAdmin = req.user?.role === "admin";

  // Build search query
  const query = {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ],
  };

  // Non-admins only see published quizzes
  if (!isAdmin) query.isPublished = true;

  // Sorting options
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
   - Admin can view unpublished quizzes
   - Non-admins blocked if the quiz is unpublished
   ------------------------------------------------------------------ */
export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const isAdmin = req.user?.role === "admin";
  if (!isAdmin && !quiz.isPublished) {
    res.status(403);
    throw new Error("Quiz is not available");
  }

  res.json({ success: true, quiz });
});

/* ------------------------------------------------------------------
   POST /api/quiz
   - Create quiz (admin only in routes)
   - Throws errors if validation fails
   ------------------------------------------------------------------ */
export const createQuiz = asyncHandler(async (req, res) => {
  const { title, category, questions } = req.body;

  if (!title || !category || !questions?.length) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  // Validate each question (throws if invalid)
  questions.forEach(validateQuestion);

  const quiz = await Quiz.create({ title, category, questions });
  res.status(201).json({ success: true, quiz });
});

/* ------------------------------------------------------------------
   PUT /api/quiz/:id
   - Update quiz (admin only)
   - Validates provided questions before save
   ------------------------------------------------------------------ */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const { title, category, questions } = req.body;

  if (title) quiz.title = title;
  if (category) quiz.category = category;

  if (Array.isArray(questions)) {
    questions.forEach(validateQuestion);
    quiz.questions = questions;
  }

  const updatedQuiz = await quiz.save();
  res.json({ success: true, quiz: updatedQuiz });
});

/* ------------------------------------------------------------------
   DELETE /api/quiz/:id
   - Delete quiz (admin only)
   ------------------------------------------------------------------ */
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  await quiz.deleteOne();
  res.json({ success: true, message: "Quiz deleted" });
});

/* ------------------------------------------------------------------
   PATCH /api/quiz/:id/publish-toggle
   - Toggle publish/unpublish (admin only)
   - Returns updated quiz
   ------------------------------------------------------------------ */
export const togglePublishQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  quiz.isPublished = !quiz.isPublished;
  await quiz.save();

  res.json({
    success: true,
    message: quiz.isPublished ? "Quiz published" : "Quiz unpublished",
    quiz,
  });
});
