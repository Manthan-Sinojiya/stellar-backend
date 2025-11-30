// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401);
    throw new Error("No token provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;

  next();
});

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin Access Denied");
  }
  next();
};
