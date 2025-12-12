/**
 * ------------------------------------------------------------------
 * Demo Call Model
 * ------------------------------------------------------------------
 * Responsibilities:
 * - Stores demo call requests submitted via website or app
 * - Admin updates status after calling user
 *
 * Fields:
 * - status: Tracks whether user has been contacted
 * ------------------------------------------------------------------
 */

import mongoose from "mongoose";

const demoCallSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String },
    message: { type: String },

    // Status for admin follow-up workflow
    status: {
      type: String,
      enum: ["not_contacted", "called"],
      default: "not_contacted",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DemoCall", demoCallSchema);
