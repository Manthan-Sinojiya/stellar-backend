// middleware/authMiddleware.js
/**
 * Authentication middleware
 * - protect: extracts JWT from Authorization Bearer header and verifies
 * - adminOnly: checks req.user.role === "admin"
 *
 * This file throws errors (no res.json returns), so a global errorHandler
 * will format the response.
 */

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const protect = asyncHandler(async (req, res, next) => {
  // Expect header: Authorization: "Bearer <token>"
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401);
    throw new Error("No token provided");
  }

  // verify token (will throw if invalid)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // decoded payload should contain { id, role, ... } — depends on your token creation
  req.user = decoded;
  next();
});

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin Access Denied");
  }
  next();
};
