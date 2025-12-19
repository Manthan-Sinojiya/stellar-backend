/**
 * ------------------------------------------------------------------
 * EXPRESS-VALIDATOR RULES
 * ------------------------------------------------------------------
 * Purpose:
 * - Validate user input for authentication, OTP flow, and quiz logic
 * - Prevent invalid data from reaching controllers
 * - Return errors through validationHandler (throws → global error handler)
 *
 * Conventions Used:
 * - Regex-based validation for strict formats
 * - .optional() for optional fields
 * - All validation messages are human-friendly
 * ------------------------------------------------------------------
 */

import { body } from "express-validator";

/* ------------------------------------------------------------------
   REGEX DEFINITIONS
   - Centralized patterns for reusability & clarity
------------------------------------------------------------------ */
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const mobileRegex = /^[6-9]\d{9}$/; // Indian 10-digit mobile number

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Requires: uppercase + lowercase + number + special char + min 8 chars

const nameRegex = /^[A-Za-z ]{3,}$/; // Minimum 3 alphabetic characters

const pincodeRegex = /^\d{6}$/; // Indian 6-digit pincode

/* ------------------------------------------------------------------
   USER REGISTRATION VALIDATION
   POST /api/auth/register
------------------------------------------------------------------ */
export const registerValidation = [
  body("fullName")
    .matches(nameRegex)
    .withMessage("Full name must be at least 3 alphabetic characters"),

  body("fatherName")
    .matches(nameRegex)
    .withMessage("Father name must contain only alphabets"),

  body("email")
    .matches(emailRegex)
    .withMessage("Enter a valid email address"),

  body("mobile")
    .matches(mobileRegex)
    .withMessage("Enter a valid 10-digit Indian mobile number"),

  body("password")
    .matches(strongPasswordRegex)
    .withMessage(
      "Password must be 8+ characters and include uppercase, lowercase, number & symbol"
    ),

  body("address1")
    .isLength({ min: 5 })
    .withMessage("Address line 1 must be at least 5 characters"),

  body("city")
    .matches(nameRegex)
    .withMessage("City name must only contain alphabets"),

  body("state")
    .matches(nameRegex)
    .withMessage("State must only contain alphabets"),

  body("pincode")
    .matches(pincodeRegex)
    .withMessage("Enter a valid 6-digit pincode"),
];

/* ------------------------------------------------------------------
   LOGIN VALIDATION
   POST /api/auth/login
------------------------------------------------------------------ */
export const loginValidation = [
  body("email").matches(emailRegex).withMessage("Valid email required"),

  body("password")
    .notEmpty()
    .withMessage("Password required"),
];

/* ------------------------------------------------------------------
   OTP SEND VALIDATION
   POST /api/otp/register
   - Only mobile required; email is optional
------------------------------------------------------------------ */
export const otpSendValidation = [
  body("mobile")
    .matches(mobileRegex)
    .withMessage("Valid Indian mobile number required"),

  body("email")
    .optional() // email not required for OTP flow
    .matches(emailRegex)
    .withMessage("Valid email required"),
];

/* ------------------------------------------------------------------
   OTP VERIFY VALIDATION
   POST /api/otp/verify-otp
   Includes nested userData.* validation
------------------------------------------------------------------ */
// export const otpVerifyValidation = [
//   body("mobile")
//     .matches(mobileRegex)
//     .withMessage("Valid mobile number required"),

//   body("otp")
//     .isLength({ min: 6, max: 6 })
//     .withMessage("OTP must be exactly 6 digits"),

//   // Nested fields for final registration
//   body("userData.fullName")
//     .matches(nameRegex)
//     .withMessage("Full name must be alphabetic"),

//   body("userData.email")
//     .matches(emailRegex)
//     .withMessage("Valid email required"),

//   body("userData.password")
//     .matches(strongPasswordRegex)
//     .withMessage(
//       "Password must be 8+ chars with uppercase, lowercase, number & special symbol"
//     ),
// ];

export const otpVerifyValidation = [
  body("mobile")
    .matches(mobileRegex)
    .withMessage("Valid mobile number required"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must be numeric"),
];

/* ------------------------------------------------------------------
   QUIZ RESULT VALIDATION
   (Used only if admin manually updates quiz result)
------------------------------------------------------------------ */
export const quizValidation = [
  body("score").isNumeric().withMessage("Score must be numeric"),
  body("percentage").isNumeric().withMessage("Percentage must be numeric"),
  body("totalMarks").isNumeric().withMessage("Total marks must be numeric"),
  body("attempted").isNumeric().withMessage("Attempted must be numeric"),
];
