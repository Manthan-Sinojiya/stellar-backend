/**
 * ------------------------------------------------------------------
 * Global Error Handling Middleware
 * ------------------------------------------------------------------
 * Purpose:
 * - Captures all thrown errors from controllers & middleware
 * - Ensures consistent JSON error format
 * - Sets status code based on:
 *      → res.statusCode if already set
 *      → otherwise defaults to 500
 *
 * JSON Response Format:
 * {
 *   success: false,
 *   message: "Error message"
 * }
 *
 * Why throw errors instead of res.json?
 * - Keeps controllers clean
 * - Centralizes error formatting
 * - asyncHandler automatically forwards errors here
 * ------------------------------------------------------------------
 */

export const errorHandler = (err, req, res, next) => {
  // Log the error for server debugging
  console.error("Error:", err);

  // If controller explicitly set statusCode, use it; else default to 500
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
  });
};
