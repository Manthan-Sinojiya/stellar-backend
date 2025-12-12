/**
 * ------------------------------------------------------------------
 * DEMO CALL & OTP CONTROLLER
 * ------------------------------------------------------------------
 * Handles:
 * - Sending OTP using MSG91
 * - Verifying OTP using MSG91
 * - Booking demo call requests
 * - Fetching all demo call entries (Admin use)
 * - Deleting demo call entries
 * - Updating demo call follow-up status
 *
 * Design Principles:
 * - asyncHandler for async flow
 * - Errors are thrown → handled by global error handler
 * - Each action in its own dedicated function
 * ------------------------------------------------------------------
 */

import asyncHandler from "express-async-handler";
import DemoCall from "../models/DemoCall.js";
import { sendOtpMsg91, verifyOtpMsg91 } from "../services/msg91Service.js";

/* ------------------------------------------------------------------
   POST /api/demo-call/send-otp
   - Sends OTP to user's mobile number via MSG91
------------------------------------------------------------------ */
export const sendOtp = asyncHandler(async (req, res) => {
  await sendOtpMsg91(req.body.mobile);

  res.status(200).json({
    message: "OTP sent successfully",
  });
});

/* ------------------------------------------------------------------
   POST /api/demo-call/verify-otp
   - Verifies OTP using MSG91 API
------------------------------------------------------------------ */
export const verifyOtp = asyncHandler(async (req, res) => {
  const result = await verifyOtpMsg91(req.body.mobile, req.body.otp);

  if (!result || result.type !== "success") {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  res.status(200).json({
    message: "OTP verified successfully",
  });
});

/* ------------------------------------------------------------------
   POST /api/demo-call/book
   - Creates a new demo call request
------------------------------------------------------------------ */
export const bookDemoCall = asyncHandler(async (req, res) => {
  const saved = await DemoCall.create(req.body);

  if (!saved) {
    res.status(400);
    throw new Error("Failed to save demo call");
  }

  res.status(201).json({
    message: "Demo call booked successfully",
    data: saved,
  });
});

/* ------------------------------------------------------------------
   GET /api/demo-call/all
   - Fetch all scheduled demo calls (Admin)
------------------------------------------------------------------ */
export const getAllDemoCalls = asyncHandler(async (req, res) => {
  const calls = await DemoCall.find().sort({ createdAt: -1 });

  if (!calls) {
    res.status(404);
    throw new Error("No schedule call data found");
  }

  res.status(200).json({
    message: "Schedule call list fetched successfully",
    data: calls,
  });
});

/* ------------------------------------------------------------------
   DELETE /api/demo-call/:id
   - Deletes a demo call entry
------------------------------------------------------------------ */
export const deleteDemoCall = asyncHandler(async (req, res) => {
  const deleted = await DemoCall.findByIdAndDelete(req.params.id);

  if (!deleted) {
    res.status(404);
    throw new Error("Entry not found");
  }

  res.status(200).json({
    message: "Entry deleted successfully",
    deletedId: req.params.id,
  });
});

/* ------------------------------------------------------------------
   PUT /api/demo-call/status/:id
   - Updates the status of a demo call request
   - "not_contacted" | "called"
------------------------------------------------------------------ */
export const updateDemoCallStatus = asyncHandler(async (req, res) => {
  const updated = await DemoCall.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  if (!updated) {
    res.status(404);
    throw new Error("Entry not found");
  }

  res.status(200).json({
    message: "Status updated",
    data: updated,
  });
});
