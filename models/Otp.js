// models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }
});

export default mongoose.model("Otp", otpSchema);
