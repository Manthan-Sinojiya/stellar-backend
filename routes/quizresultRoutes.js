// routes/quizresultRoutes.js
import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import { saveQuizResult } from "../controllers/quizresultController.js";
import QuizResult from "../models/QuizResult.js";
import { quizValidation } from "../validators/allValidations.js";
import { validate } from "../middleware/validationHandler.js";

const router = express.Router();

/* ======================================================================
   1. POST /api/quizresult/submit
   PURPOSE: Student submits quiz result
   SECURITY: Protected (JWT required)
   HANDLER: saveQuizResult controller
   NOTE: asyncHandler catches all errors thrown inside controller
====================================================================== */
router.post(
  "/submit",
  protect,
  quizValidation,
  validate,
  saveQuizResult
);

/* ======================================================================
   2. GET /api/quizresult/results   (ADMIN PANEL)
   PURPOSE: Admin gets all quiz results from all students
   SECURITY: Add `protect` + `admin` middleware if needed
   NOTE: Returns formatted results list
====================================================================== */
router.get(
  "/results",
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find()
      .populate("userId", "fullName email contactNumber")
      .sort({ createdAt: -1 });

    // If no results found, throw an error (handled by asyncHandler)
    if (!results || results.length === 0) {
      res.status(404);
      throw new Error("No quiz results found");
    }

    res.json({
      success: true,
      results,
    });
  })
);

/* ======================================================================
   3. GET /api/quizresult/my/:quizId
   PURPOSE: Student gets THEIR OWN quiz result for a specific quiz
   SECURITY: Protected (JWT required)
   EXAMPLE: A student completed quiz with id 67asdsd67df → load result
====================================================================== */
router.get(
  "/my/:quizId",
  protect,
  asyncHandler(async (req, res) => {
    // Find result by student ID + quiz ID
    const result = await QuizResult.findOne({
      userId: req.user.id,
      quizId: req.params.quizId,
    });

    // If no result found -> throw 404
    if (!result) {
      res.status(404);
      throw new Error("No quiz result found for this quiz");
    }

    res.json({ success: true, result });
  })
);

/* ======================================================================
   4. GET /api/quizresult/my-results
   PURPOSE: Student gets list of ALL quizzes they have attempted
   SECURITY: Protected
====================================================================== */
router.get(
  "/my-results",
  protect,
  asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ userId: req.user.id });

    if (!results || results.length === 0) {
      res.status(404);
      throw new Error("You have not attempted any quizzes yet");
    }

    res.json({ success: true, results });
  })
);

/* ======================================================================
   5. PUT /api/quizresult/results/:id
   PURPOSE: Admin edits a student's result (optional feature)
====================================================================== */
router.put(
  "/results/:id",
  asyncHandler(async (req, res) => {
    const { score, percentage, attempted, totalMarks } = req.body;

    const updated = await QuizResult.findByIdAndUpdate(
      req.params.id,
      { score, percentage, attempted, totalMarks },
      { new: true }
    );

    if (!updated) {
      res.status(404);
      throw new Error("Quiz result not found");
    }

    res.json({ success: true, message: "Quiz result updated", updated });
  })
);

/* ======================================================================
   6. DELETE /api/quizresult/results/:id
   PURPOSE: Admin deletes a quiz result
====================================================================== */
router.delete(
  "/results/:id",
  asyncHandler(async (req, res) => {
    const removed = await QuizResult.findByIdAndDelete(req.params.id);

    if (!removed) {
      res.status(404);
      throw new Error("Quiz result not found");
    }

    res.json({ success: true, message: "Quiz result deleted" });
  })
);

export default router;
