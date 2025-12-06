import express from "express";
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz
} from "../controllers/quizController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Anyone with token can list quizzes (students see only published)
router.get("/", protect, getQuizzes);

// 🔐 Anyone with token can view a quiz (if published or admin)
router.get("/:id", protect, getQuiz);

// 🔐 Admin Only
router.post("/", protect, adminOnly, createQuiz);
router.put("/:id", protect, adminOnly, updateQuiz);
router.delete("/:id", protect, adminOnly, deleteQuiz);

// 🔐 Publish & Unpublish
router.patch("/:id/publish-toggle", protect, adminOnly, togglePublishQuiz);

export default router;
