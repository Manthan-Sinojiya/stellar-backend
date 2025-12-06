// routes/quizRoutes.js
import express from "express";
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz,
} from "../controllers/quizController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public for listing (but only published for students)
router.get("/", protect, getQuizzes);

// Single quiz
router.get("/:id", protect, getQuiz);

// Admin-only routes
router.post("/", protect, admin, createQuiz);
router.put("/:id", protect, admin, updateQuiz);
router.delete("/:id", protect, admin, deleteQuiz);

// Publish / Unpublish
router.patch("/:id/publish-toggle", protect, admin, togglePublishQuiz);

export default router;
