/**
 * ------------------------------------------------------------------
 * DEMO CALL & OTP CONTROLLER (AWS SNS VERSION)
 * ------------------------------------------------------------------
 * Handles:
 * - Sending OTP using AWS SNS
 * - Verifying OTP using MongoDB + TTL
 * - Booking demo call requests
 * - Fetching all demo call entries (Admin)
 * - Deleting demo call entries
 * - Updating demo call follow-up status
 * ------------------------------------------------------------------
 */

import asyncHandler from "express-async-handler";
import DemoCall from "../models/DemoCall.js";
import Otp from "../models/Otp.js";
import { sendOtp, sendSnsOtp } from "../services/awsSnsService.js";

/* -------------------------------------------------------
   Helper: Generate 6-digit OTP
------------------------------------------------------- */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ------------------------------------------------------------------
   POST /api/demo-call/send-otp
   - Sends OTP using AWS SNS
------------------------------------------------------------------ */
export const sendDemoCallOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || mobile.length !== 10) {
    res.status(400);
    throw new Error("Invalid mobile number");
  }

  const otp = generateOtp();

  // ✅ This now works
  await sendSnsOtp(mobile, otp);

  await Otp.findOneAndUpdate(
    { mobile },
    { otp, createdAt: new Date() },
    { upsert: true }
  );

  res.status(200).json({ message: "OTP sent successfully" });
});

/* ------------------------------------------------------------------
   POST /api/demo-call/verify-otp
   - Verifies OTP (MongoDB + TTL)
------------------------------------------------------------------ */
export const verifyDemoCallOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  const record = await Otp.findOne({ mobile });

  if (!record) {
    res.status(400);
    throw new Error("OTP expired or not found");
  }

  if (record.otp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  await Otp.deleteOne({ mobile });

  res.status(200).json({ message: "OTP verified successfully" });
});

/* ------------------------------------------------------------------
   POST /api/demo-call/book
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
   GET /api/demo-call/all (Admin)
------------------------------------------------------------------ */
export const getAllDemoCalls = asyncHandler(async (req, res) => {
  const calls = await DemoCall.find().sort({ createdAt: -1 });

  if (!calls.length) {
    res.status(404);
    throw new Error("No scheduled calls found");
  }

  res.status(200).json({
    message: "Schedule call list fetched successfully",
    data: calls,
  });
});

/* ------------------------------------------------------------------
   DELETE /api/demo-call/:id
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
