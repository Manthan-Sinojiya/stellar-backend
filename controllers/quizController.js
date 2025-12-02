import Quiz from "../models/Quiz.js";
import asyncHandler from "express-async-handler";

// GET ALL QUIZZES (with optional pagination)
export const getQuizzes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const quizzes = await Quiz.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Quiz.countDocuments();

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    quizzes,
  });
});

// GET SINGLE QUIZ
export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, quiz });
});

// CREATE QUIZ
export const createQuiz = asyncHandler(async (req, res) => {
  const { title, category, questions } = req.body;

  if (!title || !category || !Array.isArray(questions) || questions.length === 0) {
    const error = new Error("Title, category, and at least one question are required");
    error.statusCode = 400;
    throw error;
  }

  // Validate questions
  for (const question of questions) {
    if (!question.text || !Array.isArray(question.options) || question.options.length < 2) {
      const error = new Error("Each question must have text and at least two options");
      error.statusCode = 400;
      throw error;
    }

    if (!question.correctAnswer || !question.options.includes(question.correctAnswer)) {
      const error = new Error("Each question must have a valid correct answer");
      error.statusCode = 400;
      throw error;
    }
  }

  const quiz = await Quiz.create({ title, category, questions });

  res.status(201).json({ success: true, quiz });
});

// UPDATE QUIZ
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  const { title, category, questions } = req.body;

  // Only update if fields are provided
  if (title) quiz.title = title;
  if (category) quiz.category = category;

  // Validate questions
  if (Array.isArray(questions)) {
    for (const question of questions) {
      if (!question.text || !Array.isArray(question.options) || question.options.length < 2) {
        const error = new Error("Each question must have text and at least two options");
        error.statusCode = 400;
        throw error;
      }

      if (!question.correctAnswer || !question.options.includes(question.correctAnswer)) {
        const error = new Error("Each question must have a valid correct answer");
        error.statusCode = 400;
        throw error;
      }
    }

    quiz.questions = questions;
  }

  const updatedQuiz = await quiz.save();

  res.json({ success: true, quiz: updatedQuiz });
});

// DELETE QUIZ
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  await quiz.deleteOne();

  res.json({ success: true, message: "Quiz deleted" });
});
