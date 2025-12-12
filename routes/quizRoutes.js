/**
 * ------------------------------------------------------------------
 * QUIZ ROUTES
 * ------------------------------------------------------------------
 * Endpoints:
 * - GET    /            → List quizzes (students see only published)
 * - GET    /:id         → View a single quiz
 * - POST   /            → Create quiz (Admin only)
 * - PUT    /:id         → Update quiz (Admin only)
 * - DELETE /:id         → Delete quiz (Admin only)
 * - PATCH  /:id/publish-toggle → Publish/unpublish quiz (Admin only)
 *
 * Notes:
 * - protect middleware ensures user's role is available to controller
 * - adminOnly enforces admin-restricted endpoints
 * ------------------------------------------------------------------
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

/* ------------------------------------------------------------------
   List Quizzes
   - Students: Only published quizzes
   - Admin: All quizzes
   - Supports pagination, sorting, search
------------------------------------------------------------------ */
router.get("/", protect, getQuizzes);

/* ------------------------------------------------------------------
   Get Single Quiz
   - Students blocked from unpublished quizzes
------------------------------------------------------------------ */
router.get("/:id", protect, getQuiz);

/* --------------------- Admin-Only Quiz CRUD ---------------------- */

router.post("/", protect, adminOnly, createQuiz);

router.put("/:id", protect, adminOnly, updateQuiz);

router.delete("/:id", protect, adminOnly, deleteQuiz);

/* ------------------------------------------------------------------
   Toggle Publish State
   - Makes quiz visible or hidden from students
------------------------------------------------------------------ */
router.patch("/:id/publish-toggle", protect, adminOnly, togglePublishQuiz);

export default router;
