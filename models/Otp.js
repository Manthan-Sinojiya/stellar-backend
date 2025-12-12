/**
 * ------------------------------------------------------------------
 * OTP Model
 * ------------------------------------------------------------------
 * Responsibilities:
 * - Stores OTP mapped to a mobile number
 * - Auto-expires using MongoDB TTL (Time To Live)
 *
 * How TTL Works:
 * - 'createdAt' has an expires: 300 → document deletes after 300 sec (5 min)
 * - Ensures expired OTPs are not stored forever
 * ------------------------------------------------------------------
 */

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true }, // Mobile number linked to OTP
  otp: { type: String, required: true },    // The generated 6-digit OTP

  // TTL index — expires automatically after 5 minutes
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export default mongoose.model("Otp", otpSchema);
