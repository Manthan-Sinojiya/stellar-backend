// middleware/errorHandler.js
/**
 * Global error handler
 * - Logs server-side error message
 * - Uses res.statusCode when already set or defaults to 500
 * - Responds with { success: false, message }
 *
 * Usage: app.use(errorHandler) at the end of express middleware stack.
 */

export const errorHandler = (err, req, res, next) => {
  // Log full error on server console (helpful during debugging)
  console.error("Error:", err);

  // If a controller already set res.statusCode (e.g., 404), use it;
  // otherwise default to 500 (internal server error)
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
  });
};
