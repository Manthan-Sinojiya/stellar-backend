import express from "express";
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz
} from "../controllers/quizController.js";

const router = express.Router();

router.get("/", getQuizzes);
router.get("/:id", getQuiz);
router.post("/", createQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

// ⭐ NEW PUBLISH / UNPUBLISH ROUTE
router.patch("/:id/publish-toggle", togglePublishQuiz);

export default router;
