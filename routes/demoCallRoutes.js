import express from "express";
import asyncHandler from "express-async-handler";
import DemoCall from "../models/DemoCall.js";
import { sendOtpMsg91, verifyOtpMsg91 } from "../services/msg91Service.js";

const router = express.Router();

// SEND OTP
router.post(
  "/send-otp",
  asyncHandler(async (req, res) => {
    await sendOtpMsg91(req.body.mobile);

    res.status(200).json({
      message: "OTP sent successfully",
    });
  })
);

// VERIFY OTP
router.post(
  "/verify-otp",
  asyncHandler(async (req, res) => {
    const result = await verifyOtpMsg91(req.body.mobile, req.body.otp);

    if (!result || result.type !== "success") {
      res.status(400);
      throw new Error("Invalid OTP");
    }

    res.status(200).json({
      message: "OTP verified successfully",
    });
  })
);

// BOOK DEMO
router.post(
  "/book",
  asyncHandler(async (req, res) => {
    try {
      const saved = await DemoCall.create(req.body);

      res.status(201).json({
        message: "Demo call booked successfully",
        data: saved,
      });
    } catch (err) {
      console.error("BOOKING ERROR:", err);
      res.status(400).json({
        message: "Failed to book demo",
        error: err.message,
      });
    }
  })
);

export default router;
