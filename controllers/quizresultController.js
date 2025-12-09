// controllers/quizresultController.js
/**
 * Handles evaluating quiz submissions and storing results.
 *
 * Why evaluation must be done in backend?
 * - Prevents cheating (students can't modify score in frontend)
 * - Ensures accurate comparison between correct answers and submitted answers
 * - Centralized validation for MCQ, checkbox, and text questions
 */

import asyncHandler from "express-async-handler";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";

/**
 * POST /api/quizresult/submit
 * Student submits quiz answers → backend evaluates and saves result
 */
export const submitQuizResult = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { quizId, answers } = req.body;

  if (!quizId || !answers) {
    return res.status(400).json({
      success: false,
      message: "quizId and answers are required",
    });
  }

  // Load quiz with original questions and correct answers
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({ success: false, message: "Quiz not found" });
  }

  let score = 0;
  const evaluatedAnswers = [];

  /**
   * Loop each question and compare user's answer with correct answer.
   * Supports:
   * - MCQ (single choice)
   * - Checkbox (multiple choice)
   * - Text answers
   */
  quiz.questions.forEach((q, index) => {
    const submitted = answers[index];
    let isCorrect = false;

    /** -------------------------------
     * 1️⃣ Evaluate MCQ Question
     --------------------------------*/
    if (q.type === "mcq") {
      const correctIndex = q.options.indexOf(q.answer);
      const userIndex = Number(submitted?.selectedIndex);

      if (userIndex === correctIndex) {
        isCorrect = true;
        score++;
      }

      evaluatedAnswers.push({
        question: q.question,
        type: "mcq",
        options: q.options,
        correctIndex,
        userIndex,
        isCorrect,
      });
    }

    /** -------------------------------
     * 2️⃣ Evaluate CHECKBOX Question
     *    - Compare two sets of answers
     --------------------------------*/
    if (q.type === "checkbox") {
      const correct = q.answer.map((x) => x.trim());
      const user = (submitted?.selected || []).map((x) => x.trim());

      const correctSet = new Set(correct);
      const userSet = new Set(user);

      const matched =
        correctSet.size === userSet.size &&
        [...correctSet].every((x) => userSet.has(x));

      if (matched) {
        isCorrect = true;
        score++;
      }

      evaluatedAnswers.push({
        question: q.question,
        type: "checkbox",
        correctAnswers: correct,
        userAnswers: user,
        isCorrect,
      });
    }

    /** -------------------------------
     * 3️⃣ Evaluate TEXT Question
     *    - Simple lowercase comparison
     --------------------------------*/
    if (q.type === "text") {
      const correctText = q.answer.trim().toLowerCase();
      const userText = (submitted?.written || "").trim().toLowerCase();

      if (userText === correctText) {
        isCorrect = true;
        score++;
      }

      evaluatedAnswers.push({
        question: q.question,
        type: "text",
        correctText: q.answer,
        userText: submitted?.written,
        isCorrect,
      });
    }
  });

  // Final score calculation
  const percentage = (score / quiz.questions.length) * 100;

  // Save attempt result in database
  const result = await QuizResult.create({
    userId,
    quizId,
    score,
    totalMarks: quiz.questions.length,
    percentage,
    attempted: quiz.questions.length,
    answers: evaluatedAnswers, // stores detailed answer comparison
  });

  res.json({
    success: true,
    message: "Quiz evaluated and saved successfully!",
    result,
  });
});
