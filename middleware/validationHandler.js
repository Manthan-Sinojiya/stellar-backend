/**
 * ------------------------------------------------------------------
 * Request Validation Handler (express-validator)
 * ------------------------------------------------------------------
 * Purpose:
 * - Reads validation errors set by express-validator
 * - Formats them into a clean array of messages
 * - Throws a single combined error message (handled globally)
 *
 * Why throw new Error?
 * - Ensures global errorHandler formats the validation response
 * - Keeps routes/controllers clean
 *
 * Example Response:
 * {
 *   success: false,
 *   message: "Full name required, Email invalid"
 * }
 * ------------------------------------------------------------------
 */

import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  // If validation errors exist
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => err.msg);

    // Throw error instead of sending response
    const error = new Error(formatted.join(", "));
    error.status = 400; // HTTP Bad Request
    throw error;
  }

  next();
};
