/**
 * ---------------------------------------------------------
 * AUTHENTICATION & AUTHORIZATION
 * ---------------------------------------------------------
 * protect():
 * - Checks JWT token
 * - Attaches user info to req.user
 *
 * adminOnly():
 * - Allows access only to admin users
 * ---------------------------------------------------------
 */

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

/* -------------------- AUTH CHECK -------------------- */
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Authentication token missing");
    err.statusCode = 401;
    err.code = "TOKEN_MISSING";
    throw err;
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded; // { id, role }
  next();
});

/* -------------------- ADMIN CHECK -------------------- */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    const err = new Error("Admin access denied");
    err.statusCode = 403;
    err.code = "ADMIN_ONLY";
    throw err;
  }
  next();
};
