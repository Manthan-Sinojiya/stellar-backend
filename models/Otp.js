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

const otpSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // 5 minutes
    },
  },
  { timestamps: false }
);

export default mongoose.model("Otp", otpSchema);

