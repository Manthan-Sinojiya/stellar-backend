// routes/quizRoutes.js
/**
 * Quiz routes
 * - Most routes are protected so we know user's role (so getQuizzes can filter)
 * - Admin-only endpoints use adminOnly middleware
 */

import express from "express";
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz,
} from "../controllers/quizController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// List quizzes (protected so server can know if requester is admin)
// Query params: page, limit, search, sort
router.get("/", protect, getQuizzes);

// Get a single quiz (protect to enforce unpublished hiding)
router.get("/:id", protect, getQuiz);

// Admin-only CRUD
router.post("/", protect, adminOnly, createQuiz);
router.put("/:id", protect, adminOnly, updateQuiz);
router.delete("/:id", protect, adminOnly, deleteQuiz);

// Publish/unpublish toggle (admin only)
router.patch("/:id/publish-toggle", protect, adminOnly, togglePublishQuiz);

export default router;
