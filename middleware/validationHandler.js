/**
 * ---------------------------------------------------------
 * VALIDATION HANDLER
 * ---------------------------------------------------------
 * - Reads errors from express-validator
 * - Combines them into ONE clean message
 * - Throws error → handled by global errorHandler
 * ---------------------------------------------------------
 */

import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array().map(err => err.msg).join(", ");

    const error = new Error(message);
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";

    throw error;
  }

  next();
};
