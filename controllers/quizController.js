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
// export const getQuiz = asyncHandler(async (req, res) => {
//   const quiz = await Quiz.findById(req.params.id);

//   if (!quiz) {
//     res.status(404);
//     throw new Error("Quiz not found");
//   }

//   const isAdmin = req.user?.role === "admin";

//   // Block unpublished quizzes for students
//   if (!isAdmin && !quiz.isPublished) {
//     res.status(403);
//     throw new Error("Quiz is not available");
//   }

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
import asyncHandler from "express-async-handler";

/**
 * Helper: Validate a single question object
 * Ensures the structure coming from the CSV or UI is correct before saving to DB
 */
const validateQuestion = (q, setIndex, qIndex) => {
  if (!q || typeof q !== "object") {
    throw new Error(`Invalid question object at Set ${setIndex + 1}, Question ${qIndex + 1}`);
  }

  if (!q.question || !q.question.toString().trim()) {
    throw new Error(`Question text is required at Set ${setIndex + 1}, Question ${qIndex + 1}`);
  }

  if (!["mcq", "checkbox", "text"].includes(q.type)) {
    throw new Error(`Invalid type '${q.type}' at Set ${setIndex + 1}, Question ${qIndex + 1}`);
  }

  // Options validation for choice-based questions
  if (q.type !== "text") {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`MCQ/Checkbox requires at least 2 options at Set ${setIndex + 1}, Question ${qIndex + 1}`);
    }
    
    // Ensure answer exists for MCQs
    if (q.type === "mcq" && (!q.answer || q.answer === "")) {
      throw new Error(`Correct answer must be selected for MCQ at Set ${setIndex + 1}, Question ${qIndex + 1}`);
    }
  }

  // Answer validation for text questions
  if (q.type === "text" && (!q.answer || q.answer.toString().trim() === "")) {
    throw new Error(`Reference answer is required for written questions at Set ${setIndex + 1}, Question ${qIndex + 1}`);
  }
};

/* ------------------------------------------------------------------
   GET /api/quiz
   Lists all quizzes. Students see only published ones.
------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   GET /api/quiz/:id
   Fetches a single quiz. 
   CRITICAL: If a student fetches, they only receive ONE assigned set.
------------------------------------------------------------------ */
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

//     // Logic to assign a set (A, B, or C) based on User ID
//     if (quiz.sets && quiz.sets.length > 0) {
//       const userHash = req.user._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//       const assignedSetIdx = userHash % quiz.sets.length;
//       const assignedSet = quiz.sets[assignedSetIdx];

//       const quizObj = quiz.toObject();
//       // Overwrite sets with just the assigned questions for security/fairness
//       quizObj.questions = assignedSet.questions; 
//       quizObj.assignedSetName = assignedSet.setName;
//       delete quizObj.sets; // Remove other sets from the response

//       return res.json({ success: true, quiz: quizObj });
//     }
//   }

//   res.json({ success: true, quiz });
// });

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const isAdmin = req.user?.role === "admin";

  if (!isAdmin) {
    if (!quiz.isPublished) {
      res.status(403);
      throw new Error("Quiz is not available");
    }

    // --- RANDOMIZED SET ALLOCATION LOGIC ---
    if (quiz.sets && quiz.sets.length > 0) {
      // Create a unique seed using User ID and Quiz ID
      const seed = req.user._id.toString() + quiz._id.toString();
      const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Select the set based on the hash
      const assignedSetIdx = hash % quiz.sets.length;
      const assignedSet = quiz.sets[assignedSetIdx];

      const quizObj = quiz.toObject();
      
      // Inject the assigned set's questions into the main questions field
      quizObj.questions = assignedSet.questions; 
      quizObj.assignedSetName = assignedSet.setName;
      
      // Security: Remove the full 'sets' array so students can't see other sets via Network tab
      delete quizObj.sets; 

      return res.json({ success: true, quiz: quizObj });
    }
  }

  // Admin still sees everything including the full sets array
  res.json({ success: true, quiz });
});
/* ------------------------------------------------------------------
   POST /api/quiz
   Creates a new quiz with the nested sets structure.
------------------------------------------------------------------ */
export const createQuiz = asyncHandler(async (req, res) => {
  const { title, category, sets, duration } = req.body;

  if (!title || !category || !sets || !Array.isArray(sets) || sets.length === 0) {
    res.status(400);
    throw new Error("Title, Category, and at least one Question Set are required.");
  }

  // Validate all questions in all sets
  sets.forEach((set, sIdx) => {
    if (!set.questions || set.questions.length === 0) {
      throw new Error(`Set '${set.setName || sIdx}' must have at least one question.`);
    }
    set.questions.forEach((q, qIdx) => validateQuestion(q, sIdx, qIdx));
  });

  const quiz = await Quiz.create({
    title,
    category,
    sets,
    duration: duration || 0,
  });

  res.status(201).json({
    success: true,
    quiz,
  });
});

/* ------------------------------------------------------------------
   PUT /api/quiz/:id
   Updates an existing quiz.
------------------------------------------------------------------ */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const { title, category, sets, duration } = req.body;

  if (title) quiz.title = title;
  if (category) quiz.category = category;
  if (duration !== undefined) quiz.duration = duration;
  
  if (sets && Array.isArray(sets)) {
    sets.forEach((set, sIdx) => {
      set.questions.forEach((q, qIdx) => validateQuestion(q, sIdx, qIdx));
    });
    quiz.sets = sets;
  }

  const updatedQuiz = await quiz.save();

  res.json({
    success: true,
    quiz: updatedQuiz,
  });
});

/* ------------------------------------------------------------------
   DELETE /api/quiz/:id
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
    message: "Quiz deleted successfully",
  });
});

/* ------------------------------------------------------------------
   PATCH /api/quiz/:id/publish-toggle
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
    message: quiz.isPublished ? "Quiz is now live" : "Quiz hidden from students",
    quiz,
  });
});