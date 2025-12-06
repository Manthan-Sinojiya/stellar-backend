import express from "express";
import asyncHandler from "express-async-handler";
import DemoCall from "../models/DemoCall.js";
// import { sendOtpMsg91, verifyOtpMsg91 } from "../services/msg91Service.js";

const router = express.Router();

// SEND OTP
// router.post(
//   "/send-otp",
//   asyncHandler(async (req, res) => {
//     await sendOtpMsg91(req.body.mobile);

//     res.status(200).json({
//       message: "OTP sent successfully",
//     });
//   })
// );

// VERIFY OTP
// router.post(
//   "/verify-otp",
//   asyncHandler(async (req, res) => {
//     const result = await verifyOtpMsg91(req.body.mobile, req.body.otp);

//     if (!result || result.type !== "success") {
//       res.status(400);
//       throw new Error("Invalid OTP");
//     }

//     res.status(200).json({
//       message: "OTP verified successfully",
//     });
//   })
// );

/* ======================================================
   BOOK DEMO CALL (POST /api/demo-call/book)
====================================================== */
router.post(
  "/book",
  asyncHandler(async (req, res) => {
    const saved = await DemoCall.create(req.body);

    if (!saved) {
      res.status(400);
      throw new Error("Failed to save demo call");
    }

    res.status(201).json({
      message: "Demo call booked successfully",
      data: saved,
    });
  })
);

/* ======================================================
   GET ALL DEMO CALL REQUESTS (Admin)
   GET /api/demo-call/all
====================================================== */
router.get(
  "/all",
  asyncHandler(async (req, res) => {
    const calls = await DemoCall.find().sort({ createdAt: -1 });

    if (!calls) {
      res.status(404);
      throw new Error("No schedule call data found");
    }

    res.status(200).json({
      message: "Schedule call list fetched successfully",
      data: calls,
    });
  })
);

export default router;
