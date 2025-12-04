// export default router;

import express from "express";
import { registerUser, verifyOtpAndCreate } from "../controllers/otpController.js";
import {
  otpSendValidation,
  otpVerifyValidation
} from "../validators/allValidations.js";
import { validate } from "../middleware/validationHandler.js";

const router = express.Router();

router.post("/register", otpSendValidation, validate, registerUser);
router.post("/verify-otp", otpVerifyValidation, validate, verifyOtpAndCreate);

export default router;
