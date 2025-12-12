/**
 * ------------------------------------------------------------------
 * Authentication & Authorization Middleware
 * ------------------------------------------------------------------
 * protect()
 * - Extracts JWT from Authorization header ("Bearer <token>")
 * - Verifies token using JWT_SECRET
 * - Attaches decoded payload to req.user
 * - Throws 401 on missing/invalid token
 *
 * adminOnly()
 * - Ensures only admin users can access protected endpoints
 * - Throws 403 if req.user.role is not "admin"
 *
 * Best Practices:
 * - No try/catch; asyncHandler + errorHandler manage errors globally.
 * - Minimal logic inside middleware; only access control and validation.
 * ------------------------------------------------------------------
 */

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

/* ------------------------------------------------------------------
   PROTECT MIDDLEWARE
   - Validates JWT
   - Must be applied before routes that require authentication
------------------------------------------------------------------ */
export const protect = asyncHandler(async (req, res, next) => {
  // Expect header format: Authorization: Bearer <token>
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    res.status(401);
    throw new Error("No token provided");
  }

  // Verifies token; throws automatically on invalid signature
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Attach decoded payload (id, role, etc.) to request
  req.user = decoded;

  next();
});

/* ------------------------------------------------------------------
   ADMIN-ONLY ACCESS CONTROL
   - Ensures that req.user exists and role === 'admin'
   - Use after protect() middleware
------------------------------------------------------------------ */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin Access Denied");
  }
  next();
};
