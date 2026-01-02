// /**
//  * ------------------------------------------------------------------
//  * QUIZ CONTROLLER
//  * ------------------------------------------------------------------
//  * Handles:
//  * - Creating, updating, deleting quizzes (Admin-only)
//  * - Listing quizzes with pagination, search, sort
//  * - Viewing a single quiz with publish-rule enforcement
//  * - Toggling publish/unpublish status
//  *
//  * Key Design Principles:
//  * - Uses asyncHandler to bubble errors into global error handler
//  * - Validates questions via helper function (validateQuestion)
//  * - Admin restrictions enforced through auth middleware
//  * - Students can only view published quizzes
//  * ------------------------------------------------------------------
//  */

// import Quiz from "../models/Quiz.js";
// import asyncHandler from "express-async-handler";

// /* ------------------------------------------------------------------
//    Helper: Validate a single question object
//    - Ensures required fields based on question type
//    - Throws Error on invalid structure
// ------------------------------------------------------------------ */
// const validateQuestion = (q) => {
//   if (!q || typeof q !== "object") throw new Error("Invalid question object");

//   if (!q.question || !q.question.toString().trim())
//     throw new Error("Question text is required");

//   if (!["mcq", "checkbox", "text"].includes(q.type))
//     throw new Error("Invalid question type");

//   // MCQ & Checkbox require options
//   if (q.type !== "text") {
//     if (!Array.isArray(q.options) || q.options.length < 2)
//       throw new Error("MCQ/Checkbox requires at least 2 options");
//   }

//   // MCQ requires a single correct answer
//   if (q.type === "mcq") {
//     if (!q.answer || typeof q.answer !== "string")
//       throw new Error("MCQ requires a correct answer (string)");
//     if (!q.options.includes(q.answer))
//       throw new Error("MCQ answer must match one of the options");
//   }

//   // Checkbox requires array of answers
//   if (q.type === "checkbox") {
//     if (!Array.isArray(q.answer) || q.answer.length === 0)
//       throw new Error("Checkbox type requires at least one correct answer");

//     const invalid = q.answer.some((ans) => !q.options.includes(ans));
//     if (invalid)
//       throw new Error("One or more checkbox answers are not valid options");
//   }

//   // Text requires answer string
//   if (q.type === "text") {
//     if (!q.answer || !q.answer.toString().trim())
//       throw new Error("Text question requires an answer string");
//   }
// };

// /* ------------------------------------------------------------------
//    GET /api/quiz
//    - Lists quizzes with:
//         • Pagination (page, limit)
//         • Search (title/category)
//         • Sorting (latest, oldest, A-Z, Z-A)
//    - Admin sees all quizzes
//    - Students see only published quizzes
// ------------------------------------------------------------------ */
// export const getQuizzes = asyncHandler(async (req, res) => {
//   let { page = 1, limit = 20, search = "", sort = "latest" } = req.query;
//   page = Number(page);
//   limit = Number(limit);

//   const isAdmin = req.user?.role === "admin";

//   // Build search query
//   const query = {
//     $or: [
//       { title: { $regex: search, $options: "i" } },
//       { category: { $regex: search, $options: "i" } },
//     ],
//   };

//   // Students only see published quizzes
//   if (!isAdmin) query.isPublished = true;

//   // Sorting map
//   const sortOptions = {
//     latest: { createdAt: -1 },
//     oldest: { createdAt: 1 },
//     az: { title: 1 },
//     za: { title: -1 },
//   };

//   const quizzes = await Quiz.find(query)
//     .sort(sortOptions[sort] || sortOptions.latest)
//     .skip((page - 1) * limit)
//     .limit(limit);

//   const total = await Quiz.countDocuments(query);

//   res.json({
//     success: true,
//     page,
//     pages: Math.ceil(total / limit),
//     total,
//     quizzes,
//   });
// });

// /* ------------------------------------------------------------------
//    GET /api/quiz/:id
//    - Returns a single quiz
//    - Students cannot view unpublished quizzes
//    - Admin can view everything
// ------------------------------------------------------------------ */
// // export const getQuiz = asyncHandler(async (req, res) => {
// //   const quiz = await Quiz.findById(req.params.id);

// //   if (!quiz) {
// //     res.status(404);
// //     throw new Error("Quiz not found");
// //   }

// //   const isAdmin = req.user?.role === "admin";

// //   // Block unpublished quizzes for students
// //   if (!isAdmin && !quiz.isPublished) {
// //     res.status(403);
// //     throw new Error("Quiz is not available");
// //   }

// //   res.json({ success: true, quiz });
// // });

// export const getQuiz = asyncHandler(async (req, res) => {
//   const quiz = await Quiz.findById(req.params.id);

//   if (!quiz) {
//     res.status(404);
//     throw new Error("Quiz not found");
//   }

//   const isAdmin = req.user?.role === "admin";

//   if (!isAdmin) {
//     if (!quiz.isPublished) {
//       res.status(403);
//       throw new Error("Quiz is not available");
//     }

//     // --- AUTO-ASSIGN SET LOGIC ---
//     // Use the last character of the User ID to assign A, B, or C
//     // This is "deterministic" (User X always gets Set Y for this Quiz)
//     const sets = ["A", "B", "C"];
//     const userHash = req.user._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//     const assignedSet = sets[userHash % sets.length];

//     // Filter questions: 
//     // 1. Show questions specifically marked for their set
//     // 2. Also show questions marked "None" (common to all sets)
//     const filteredQuestions = quiz.questions.filter(q => 
//       q.set === assignedSet || q.set === "None"
//     );

//     // Convert to plain object to modify
//     const quizObj = quiz.toObject();
//     quizObj.questions = filteredQuestions;
//     quizObj.assignedSet = assignedSet; // Tell the UI which set they got

//     return res.json({ success: true, quiz: quizObj });
//   }

//   // Admin sees everything
//   res.json({ success: true, quiz });
// });

// /* ------------------------------------------------------------------
//    POST /api/quiz
//    - Creates a quiz (Admin-only)
//    - Validates each question before saving
// ------------------------------------------------------------------ */
// export const createQuiz = asyncHandler(async (req, res) => {
//   const { title, category, questions, duration } = req.body;

//   if (!title || !category || !questions?.length) {
//     res.status(400);
//     throw new Error("Missing required fields");
//   }

//   // Validate each question
//   questions.forEach(validateQuestion);

//   const quiz = await Quiz.create({
//     title,
//     category,
//     questions,
//     duration: duration || 0,
//   });

//   res.status(201).json({
//     success: true,
//     quiz,
//   });
// });

// /* ------------------------------------------------------------------
//    PUT /api/quiz/:id
//    - Update quiz details (Admin-only)
//    - Validates updated questions before saving
// ------------------------------------------------------------------ */
// export const updateQuiz = asyncHandler(async (req, res) => {
//   const quiz = await Quiz.findById(req.params.id);

//   if (!quiz) {
//     res.status(404);
//     throw new Error("Quiz not found");
//   }

//   const { title, category, questions, duration } = req.body;

//   if (title) quiz.title = title;
//   if (category) quiz.category = category;
//   if (duration !== undefined) quiz.duration = duration; // Update duration
//   if (Array.isArray(questions)) {
//     questions.forEach(validateQuestion);
//     quiz.questions = questions;
//   }

//   const updatedQuiz = await quiz.save();

//   res.json({
//     success: true,
//     quiz: updatedQuiz,
//   });
// });

// /* ------------------------------------------------------------------
//    DELETE /api/quiz/:id
//    - Deletes a quiz (Admin-only)
// ------------------------------------------------------------------ */
// export const deleteQuiz = asyncHandler(async (req, res) => {
//   const quiz = await Quiz.findById(req.params.id);

//   if (!quiz) {
//     res.status(404);
//     throw new Error("Quiz not found");
//   }

//   await quiz.deleteOne();

//   res.json({
//     success: true,
//     message: "Quiz deleted",
//   });
// });

// /* ------------------------------------------------------------------
//    PATCH /api/quiz/:id/publish-toggle
//    - Toggles quiz publish state (Admin-only)
//    - Makes quiz available/unavailable to students
// ------------------------------------------------------------------ */
// export const togglePublishQuiz = asyncHandler(async (req, res) => {
//   const quiz = await Quiz.findById(req.params.id);

//   if (!quiz) {
//     res.status(404);
//     throw new Error("Quiz not found");
//   }

//   // Toggle publish state
//   quiz.isPublished = !quiz.isPublished;
//   await quiz.save();

//   res.json({
//     success: true,
//     message: quiz.isPublished ? "Quiz published" : "Quiz unpublished",
//     quiz,
//   });
// });

import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";
import asyncHandler from "express-async-handler";

/* ---------------- QUESTION VALIDATION ---------------- */
const validateQuestion = (q) => {
  if (!q.question?.trim()) throw new Error("Question text required");

  if (!["mcq", "checkbox", "text"].includes(q.type))
    throw new Error("Invalid question type");

  if (q.type !== "text" && (!q.options || q.options.length < 2))
    throw new Error("Options required");

  if (q.type === "mcq" && !q.options.includes(q.answer))
    throw new Error("MCQ answer must match option");

  if (q.type === "checkbox" && !Array.isArray(q.answer))
    throw new Error("Checkbox requires array answer");

  if (q.type === "text" && !q.answer?.trim())
    throw new Error("Text answer required");
};

/* ---------------- CREATE QUIZ ---------------- */
export const createQuiz = asyncHandler(async (req, res) => {
  const { title, category, duration, sets } = req.body;

  if (!title || !category || !Array.isArray(sets) || sets.length === 0) {
    res.status(400);
    throw new Error("Title, Category and Sets are required");
  }

  sets.forEach((set) => {
    if (!set.setName || !set.questions?.length)
      throw new Error("Each set needs questions");

    set.questions.forEach(validateQuestion);
  });

  const quiz = await Quiz.create({
    title,
    category,
    duration,
    sets,
  });

  res.status(201).json({ success: true, quiz });
});

/* ---------------- GET QUIZZES ---------------- */
export const getQuizzes = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin";

  const query = isAdmin ? {} : { isPublished: true };

  const quizzes = await Quiz.find(query).sort({ createdAt: -1 });

  res.json({ success: true, quizzes });
});

/* ---------------- GET SINGLE QUIZ ---------------- */
// export const getQuiz = asyncHandler(async (req, res) => {
//   const quiz = await Quiz.findById(req.params.id);
//   if (!quiz) throw new Error("Quiz not found");

//   const isAdmin = req.user?.role === "admin";
//   if (!isAdmin && !quiz.isPublished) {
//     res.status(403);
//     throw new Error("Quiz not available");
//   }

//   if (!isAdmin) {
//     const sets = ["A", "B", "C"];
//     const hash = [...req.user._id.toString()].reduce((a, c) => a + c.charCodeAt(0), 0);
//     const assigned = sets[hash % quiz.sets.length];

//     const set = quiz.sets.find(s => s.setName.endsWith(assigned));
//     return res.json({ success: true, quiz: { ...quiz.toObject(), sets: [set] } });
//   }

//   res.json({ success: true, quiz });
// });

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) throw new Error("Quiz not found");

  const isAdmin = req.user?.role === "admin";
  if (!isAdmin && !quiz.isPublished) {
    res.status(403);
    throw new Error("Quiz not available");
  }

  if (!isAdmin) {
    // 1️⃣ Check if user already attempted
    let result = await QuizResult.findOne({
      quizId: quiz._id,
      userId: req.user._id,
    });

    let assignedSet;

    if (result) {
      // 2️⃣ Reuse same set
      assignedSet = quiz.sets.find(
        (s) => s.setName === result.assignedSetName
      );
    } else {
      // 3️⃣ Randomly assign NEW set
      assignedSet =
        quiz.sets[Math.floor(Math.random() * quiz.sets.length)];
    }

    return res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        category: quiz.category,
        duration: quiz.duration,
        assignedSetName: assignedSet.setName,
        questions: assignedSet.questions,
      },
    });
  }

  res.json({ success: true, quiz });
});


/* ---------------- UPDATE QUIZ ---------------- */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) throw new Error("Quiz not found");

  const { title, category, duration, sets } = req.body;

  if (title) quiz.title = title;
  if (category) quiz.category = category;
  if (duration !== undefined) quiz.duration = duration;

  if (sets) {
    sets.forEach(s => s.questions.forEach(validateQuestion));
    quiz.sets = sets;
  }

  await quiz.save();
  res.json({ success: true, quiz });
});

/* ---------------- DELETE ---------------- */
export const deleteQuiz = asyncHandler(async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ---------------- PUBLISH ---------------- */
export const togglePublishQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  quiz.isPublished = !quiz.isPublished;
  await quiz.save();

  res.json({
    success: true,
    message: quiz.isPublished ? "Quiz published" : "Quiz unpublished",
  });
});
