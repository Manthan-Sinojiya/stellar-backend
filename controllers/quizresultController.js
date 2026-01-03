import asyncHandler from "express-async-handler";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";

/**
 * @desc    Submit quiz answers and evaluate score
 * @route   POST /api/quizresult/submit
 * @access  Private (Student)
 */
export const submitQuizResult = asyncHandler(async (req, res) => {
  // 1. Verify Authentication Context
  // req.user is populated by the protect middleware
  // const userId = req.user?._id;
  const userId = req.user._id || req.user.id;
  if (!userId) {
    res.status(401);
    throw new Error("Unauthorized: User session not found");
  }

  // 2. Destructure Request Body
  const { quizId, answers, assignedSetName } = req.body;

  if (!quizId || !Array.isArray(answers) || !assignedSetName) {
    res.status(400);
    throw new Error("Invalid submission: quizId, answers, and assignedSetName are required");
  }

  // 3. Load the Quiz and Validate Metadata
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    res.status(404);
    throw new Error("Assessment not found");
  }

  // 4. Prevent Multiple Attempts
  // Uses the unique index (userId + quizId) defined in the model
  const existingAttempt = await QuizResult.findOne({ quizId, userId });
  if (existingAttempt) {
    res.status(400);
    throw new Error("Access Denied: You have already submitted this assessment");
  }

  // 5. Fetch the Specific Set Assigned to the User
  const assignedSet = quiz.sets.find((set) => set.setName === assignedSetName);
  if (!assignedSet) {
    res.status(400);
    throw new Error(`Technical Error: Set '${assignedSetName}' is not valid for this quiz`);
  }

  let score = 0;
  const evaluatedAnswers = [];

  // 6. Evaluation Logic Loop
  assignedSet.questions.forEach((question, index) => {
    // Note: The frontend must send answers in the same order as assignedSet.questions
    const submitted = answers[index];
    let isCorrect = false;

    /* --- MCQ Evaluation --- */
    if (question.type === "mcq") {
      const correctIndex = question.options.indexOf(question.answer);
      const userIndex = submitted?.selectedIndex !== undefined ? Number(submitted.selectedIndex) : null;

      if (userIndex === correctIndex && userIndex !== null) {
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

    /* --- Checkbox Evaluation --- */
    else if (question.type === "checkbox") {
      // Ensure we are comparing clean, trimmed arrays
      const correctAnswers = Array.isArray(question.answer) 
        ? question.answer.map((a) => String(a).trim()) 
        : [];
      const userAnswers = Array.isArray(submitted?.selected) 
        ? submitted.selected.map((a) => String(a).trim()) 
        : [];

      const correctSet = new Set(correctAnswers);
      const userSet = new Set(userAnswers);

      const isMatched =
        correctSet.size === userSet.size &&
        [...correctSet].every((ans) => userSet.has(ans));

      if (isMatched && correctSet.size > 0) {
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

    /* --- Text Evaluation --- */
    else if (question.type === "text") {
      const correctText = String(question.answer).trim().toLowerCase();
      const userText = String(submitted?.written || "").trim().toLowerCase();

      if (correctText === userText && correctText !== "") {
        isCorrect = true;
        score++;
      }

      evaluatedAnswers.push({
        questionId: index,
        question: question.question,
        type: "text",
        correctText: question.answer,
        userText: submitted?.written || "",
        isCorrect,
      });
    }
  });

  // 7. Calculate Final Metrics
  const totalMarks = assignedSet.questions.length;
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  // 8. Persist Result to Database
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

  // 9. Send Response
  res.status(201).json({
    success: true,
    message: "Assessment submitted and evaluated successfully",
    result: {
      id: quizResult._id,
      score,
      totalMarks,
      percentage,
      submittedAt: quizResult.createdAt
    },
  });
});

/**
 * @desc    Get current user's quiz results
 * @route   GET /api/quizresult/my-results
 * @access  Private
 */
export const getMyResults = asyncHandler(async (req, res) => {
  const results = await QuizResult.find({ userId: req.user._id })
    .populate("quizId", "title category")
    .sort("-createdAt");

  res.json({
    success: true,
    results,
  });
});