/**
 * ------------------------------------------------------------------
 * QUIZ RESULT CONTROLLER
 * ------------------------------------------------------------------
 * Responsibilities:
 * - Accept quiz submissions from students
 * - Evaluate answers against the ASSIGNED SET only
 * - Prevent multiple attempts
 * - Store detailed audit-friendly evaluation
 * - Compute score & percentage securely on backend
 *
 * Supports:
 * - MCQ
 * - Checkbox
 * - Text
 * - Multi-set quizzes
 * ------------------------------------------------------------------
 */

import asyncHandler from "express-async-handler";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";

/* ------------------------------------------------------------------
   POST /api/quizresult/submit
   - Student submits quiz answers
   - Requires authentication
------------------------------------------------------------------ */
export const submitQuizResult = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const { quizId, answers, assignedSetName } = req.body;

  if (!quizId || !Array.isArray(answers) || !assignedSetName) {
    res.status(400);
    throw new Error("quizId, answers, and assignedSetName are required");
  }

  /* ---------------- LOAD QUIZ ---------------- */
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  /* ---------------- PREVENT RE-ATTEMPT ---------------- */
  const existingAttempt = await QuizResult.findOne({
    quizId,
    userId,
  });

  if (existingAttempt) {
    res.status(400);
    throw new Error("You have already attempted this quiz");
  }

  /* ---------------- GET ASSIGNED SET ---------------- */
  const assignedSet = quiz.sets.find(
    (set) => set.setName === assignedSetName
  );

  if (!assignedSet) {
    res.status(400);
    throw new Error("Invalid assigned set");
  }

  let score = 0;
  const evaluatedAnswers = [];

  /* ------------------------------------------------------------------
     EVALUATION LOOP
  ------------------------------------------------------------------ */
  assignedSet.questions.forEach((question, index) => {
    const submitted = answers[index];
    let isCorrect = false;

    /* ---------------- MCQ ---------------- */
    if (question.type === "mcq") {
      const correctIndex = question.options.indexOf(question.answer);
      const userIndex = Number(submitted?.selectedIndex);

      if (userIndex === correctIndex) {
        isCorrect = true;
        score++;
      }

      evaluatedAnswers.push({
        questionId: index,
        question: question.question,
        type: "mcq",
        correctIndex,
        userIndex,
        isCorrect,
      });
    }

    /* ---------------- CHECKBOX ---------------- */
    if (question.type === "checkbox") {
      const correctAnswers = question.answer.map((a) => a.trim());
      const userAnswers = (submitted?.selected || []).map((a) => a.trim());

      const correctSet = new Set(correctAnswers);
      const userSet = new Set(userAnswers);

      const matched =
        correctSet.size === userSet.size &&
        [...correctSet].every((ans) => userSet.has(ans));

      if (matched) {
        isCorrect = true;
        score++;
      }

      evaluatedAnswers.push({
        questionId: index,
        question: question.question,
        type: "checkbox",
        correctAnswers,
        userAnswers,
        isCorrect,
      });
    }

    /* ---------------- TEXT ---------------- */
    if (question.type === "text") {
      const correctText = question.answer.trim().toLowerCase();
      const userText = (submitted?.written || "").trim().toLowerCase();

      if (correctText === userText) {
        isCorrect = true;
        score++;
      }

      evaluatedAnswers.push({
        questionId: index,
        question: question.question,
        type: "text",
        correctText: question.answer,
        userText: submitted?.written,
        isCorrect,
      });
    }
  });

  /* ---------------- FINAL SCORE ---------------- */
  const totalMarks = assignedSet.questions.length;
  const percentage = Math.round((score / totalMarks) * 100);

  /* ---------------- SAVE RESULT ---------------- */
  const quizResult = await QuizResult.create({
    userId,
    quizId,
    assignedSetName,
    score,
    totalMarks,
    attempted: totalMarks,
    percentage,
    answers: evaluatedAnswers,
  });

  /* ---------------- RESPONSE ---------------- */
  res.status(201).json({
    success: true,
    message: "Quiz submitted successfully",
    result: {
      id: quizResult._id,
      score,
      percentage,
      totalMarks,
    },
  });
});
