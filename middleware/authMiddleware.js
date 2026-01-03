import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1️⃣ Validate Authorization header existence & format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token missing",
      code: "TOKEN_MISSING",
    });
  }

  const token = authHeader.split(" ")[1];

  // 2️⃣ Prevent malformed / undefined tokens
  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({
      message: "Invalid authentication token",
      code: "TOKEN_INVALID",
    });
  }

  try {
    // 3️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err.message);

    return res.status(401).json({
      message: "Token expired or invalid",
      code: "TOKEN_EXPIRED",
    });
  }
});

/* -------------------------------------------------- */
/* ADMIN ONLY GUARD */
/* -------------------------------------------------- */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
      code: "ADMIN_ONLY",
    });
  }
  next();
};
