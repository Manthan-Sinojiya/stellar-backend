/**
 * ==========================================================
 * GLOBAL ERROR HANDLER (UNIVERSAL)
 * ==========================================================
 * Handles ALL errors from:
 * - Controllers (Auth, OTP, Quiz, User, Demo Call, Settings)
 * - MongoDB / Mongoose
 * - JWT Authentication
 * - Custom thrown errors
 *
 * Ensures ONE clean response format for frontend.
 * ==========================================================
 */

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  let statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  let message = err.message || "Internal Server Error";
  let code = err.code || "SERVER_ERROR";

  /* ======================================================
     🔹 MongoDB Duplicate Key Error (E11000)
  ====================================================== */
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    statusCode = 400;
    code = "DUPLICATE_FIELD";

    if (field === "email") message = "This email is already registered.";
    else if (field === "mobile")
      message = "This mobile number is already registered.";
    else message = `Duplicate value for ${field}.`;
  }

  /* ======================================================
     🔹 Mongoose Validation Errors
  ====================================================== */
  if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";

    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  /* ======================================================
     🔹 Invalid MongoDB ObjectId
  ====================================================== */
  if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid ID format.";
  }

  /* ======================================================
     🔹 JWT Errors
  ====================================================== */
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid authentication token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Session expired. Please login again.";
  }

  /* ======================================================
     🔹 OTP / AUTH / CUSTOM LOGIC ERRORS
     (Errors thrown manually in controllers)
  ====================================================== */
  if (
    message.includes("OTP") ||
    message.includes("password") ||
    message.includes("not found") ||
    message.includes("Unauthorized")
  ) {
    statusCode = statusCode || 400;
    code = code || "AUTH_ERROR";
  }

  /* ======================================================
     🔹 FINAL RESPONSE (ONE FORMAT FOR FRONTEND)
  ====================================================== */
  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};
