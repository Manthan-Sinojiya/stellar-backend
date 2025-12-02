import Quiz from "../models/Quiz.js";

// GET ALL QUIZZES
export const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find().sort({ createdAt: -1 });
  res.json({ success: true, quizzes });
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

  if (!title || !category || !questions || questions.length === 0) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
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

  quiz.title = req.body.title || quiz.title;
  quiz.category = req.body.category || quiz.category;
  quiz.questions = req.body.questions || quiz.questions;

  const updated = await quiz.save();

  res.json({ success: true, quiz: updated });
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
