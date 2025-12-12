/**
 * ------------------------------------------------------------------
 * QUIZ RESULT CONTROLLER
 * ------------------------------------------------------------------
 * Responsibilities:
 * - Accept student quiz submissions
 * - Evaluate answers against stored quiz questions
 * - Compute score, percentage, and capture detailed evaluation
 * - Store attempt in database for review and analytics
 *
 * Why evaluation must be in the backend?
 * - Prevents cheating from frontend manipulation
 * - Ensures correct answer comparison logic is centralized
 * - Allows audit trail and future re-evaluation if logic changes
 *
 * Design Principles:
 * - asyncHandler handles errors without try/catch
 * - All errors are thrown → handled by global error middleware
 * - Uses a consistent evaluation strategy for MCQ, checkbox, and text
 * ------------------------------------------------------------------
 */

import asyncHandler from "express-async-handler";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";

/* ------------------------------------------------------------------
   POST /api/quizresult/submit
   - Evaluates a student's quiz attempt
   - Requires authentication (protect middleware)
   - Stores detailed and summarized results
------------------------------------------------------------------ */
export const submitQuizResult = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  // Should never happen unless token missing/invalid
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const { quizId, answers } = req.body;

  // Basic validation of payload
  if (!quizId || !answers) {
    return res.status(400).json({
      success: false,
      message: "quizId and answers are required",
    });
  }

  // Load original quiz for evaluation
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
    });
  }

  let score = 0;
  const evaluatedAnswers = [];

  /**
   * --------------------------------------------------------------
   * EVALUATION LOOP
   * For each quiz question, compare submitted answer with correct answer.
   *
   * Question Types Supported:
   * - MCQ     → selectedIndex matches correct index
   * - Checkbox → compare selected array with correct array
   * - Text     → case-insensitive string comparison
   * --------------------------------------------------------------
   */
  quiz.questions.forEach((q, index) => {
    const submitted = answers[index];
    let isCorrect = false;

    /* --------------------------------------------------------------
       1️⃣ Evaluate MCQ
       - Correct if selectedIndex matches correct option index
    -------------------------------------------------------------- */
    if (q.type === "mcq") {
      const correctIndex = q.options.indexOf(q.answer); // correct answer index
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

    /* --------------------------------------------------------------
       2️⃣ Evaluate Checkbox
       - Convert to sets → check if all values match exactly
    -------------------------------------------------------------- */
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

    /* --------------------------------------------------------------
       3️⃣ Evaluate Text
       - Case-insensitive comparison
    -------------------------------------------------------------- */
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

  // Calculate final percentage
  const percentage = (score / quiz.questions.length) * 100;

  /* --------------------------------------------------------------
     Store final quiz attempt result in DB
  -------------------------------------------------------------- */
  const result = await QuizResult.create({
    userId,
    quizId,
    score,
    totalMarks: quiz.questions.length,
    percentage,
    attempted: quiz.questions.length,
    answers: evaluatedAnswers, // Detailed breakdown for review
  });

  res.json({
    success: true,
    message: "Quiz evaluated and saved successfully!",
    result,
  });
});
