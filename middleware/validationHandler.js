import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map(err => err.msg);

    // ❗ Throw an error instead of returning
    const error = new Error(formatted.join(", "));
    error.status = 400; // HTTP Bad Request
    throw error;
  }

  next();
};
