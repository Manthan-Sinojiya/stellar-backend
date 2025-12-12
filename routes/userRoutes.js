/**
 * ------------------------------------------------------------------
 * USER MANAGEMENT ROUTES
 * ------------------------------------------------------------------
 * Endpoints:
 * - GET    /        → Get all users
 * - POST   /        → Create user (Admin-side creation)
 * - PUT    /:id     → Update user details
 * - DELETE /:id     → Remove user
 *
 * Notes:
 * - Admin protection can be added here if required
 * - Controller handles hashing + validation
 * ------------------------------------------------------------------
 */

import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

/* ------------------------------------------------------------------
   Get all registered users
------------------------------------------------------------------ */
router.get("/", getUsers);

/* ------------------------------------------------------------------
   Create a new user (admin use)
------------------------------------------------------------------ */
router.post("/", createUser);

/* ------------------------------------------------------------------
   Update user record
------------------------------------------------------------------ */
router.put("/:id", updateUser);

/* ------------------------------------------------------------------
   Delete user record
------------------------------------------------------------------ */
router.delete("/:id", deleteUser);

export default router;
