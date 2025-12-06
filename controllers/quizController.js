// controllers/quizController.js
import Quiz from "../models/Quiz.js";
import asyncHandler from "express-async-handler";

// VALIDATION
const validateQuestion = (q) => {
  if (!q.question) throw new Error("Question text is required");

  if (!["mcq", "checkbox", "text"].includes(q.type))
    throw new Error("Invalid question type");

  if (q.type !== "text" && (!Array.isArray(q.options) || q.options.length < 2))
    throw new Error("MCQ/Checkbox requires at least 2 options");

  if (q.type === "mcq") {
    if (!q.answer) throw new Error("Answer required");
    if (!q.options.includes(q.answer))
      throw new Error("Correct answer must match an option");
  }

  if (q.type === "checkbox") {
    if (!Array.isArray(q.answer) || q.answer.length === 0)
      throw new Error("At least one correct answer is required");

    const invalid = q.answer.some((a) => !q.options.includes(a));
    if (invalid) throw new Error("One or more checkbox answers invalid");
  }

  if (q.type === "text" && !q.answer)
    throw new Error("Correct text answer required");
};

/* ============================================================
   GET QUIZZES (Admin = all quizzes, Students = only published)
============================================================ */
export const getQuizzes = asyncHandler(async (req, res) => {
  let { page = 1, limit = 20, search = "", sort = "latest" } = req.query;

  page = Number(page);
  limit = Number(limit);

  const isAdmin = req.user?.role === "admin";

  const query = {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ],
  };

  if (!isAdmin) query.isPublished = true;

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

/* ============================================================
   GET SINGLE QUIZ
============================================================ */
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

/* ============================================================
   CREATE QUIZ
============================================================ */
export const createQuiz = asyncHandler(async (req, res) => {
  const { title, category, questions } = req.body;

  if (!title || !category || !questions?.length)
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });

  try {
    questions.forEach(validateQuestion);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const quiz = await Quiz.create({ title, category, questions });

  res.status(201).json({ success: true, quiz });
});

/* ============================================================
   UPDATE QUIZ
============================================================ */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz)
    return res.status(404).json({ success: false, message: "Quiz not found" });

  const { title, category, questions } = req.body;

  if (title) quiz.title = title;
  if (category) quiz.category = category;

  if (Array.isArray(questions)) {
    try {
      questions.forEach(validateQuestion);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    quiz.questions = questions;
  }

  const updatedQuiz = await quiz.save();

  res.json({ success: true, quiz: updatedQuiz });
});

/* ============================================================
   DELETE QUIZ
============================================================ */
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz)
    return res.status(404).json({ success: false, message: "Quiz not found" });

  await quiz.deleteOne();

  res.json({ success: true, message: "Quiz deleted" });
});

/* ============================================================
   PUBLISH / UNPUBLISH QUIZ
============================================================ */
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
