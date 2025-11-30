import { body } from "express-validator";

// -------------------- REGEX DEFINITIONS --------------------
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const mobileRegex = /^[6-9]\d{9}$/;

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const nameRegex = /^[A-Za-z ]{3,}$/;

const pincodeRegex = /^\d{6}$/;

// -------------------- USER REGISTER --------------------
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

// -------------------- LOGIN --------------------
export const loginValidation = [
  body("email").matches(emailRegex).withMessage("Valid email required"),
  body("password")
    .notEmpty()
    .withMessage("Password required"),
];

// -------------------- OTP SEND --------------------
export const otpSendValidation = [
  body("mobile").matches(mobileRegex).withMessage("Valid Indian mobile number required"),

  // If email is optional, use optional() before validation
  body("email")
    .optional()
    .matches(emailRegex)
    .withMessage("Valid email required"),
];

// -------------------- OTP VERIFY --------------------
export const otpVerifyValidation = [
  body("mobile")
    .matches(mobileRegex)
    .withMessage("Valid mobile number required"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits"),

  // Nested fields (userData.*)
  body("userData.fullName")
    .matches(nameRegex)
    .withMessage("Full name must be alphabetic"),

  body("userData.email")
    .matches(emailRegex)
    .withMessage("Valid email required"),

  body("userData.password")
    .matches(strongPasswordRegex)
    .withMessage(
      "Password must be 8+ chars with uppercase, lowercase, number & special symbol"
    ),
];

// -------------------- QUIZ RESULT --------------------
export const quizValidation = [
  body("score").isNumeric().withMessage("Score must be numeric"),
  body("percentage").isNumeric().withMessage("Percentage must be numeric"),
  body("totalMarks").isNumeric().withMessage("Total marks must be numeric"),
  body("attempted").isNumeric().withMessage("Attempted must be numeric"),
];
