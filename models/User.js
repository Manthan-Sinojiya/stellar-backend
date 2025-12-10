// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  fatherName: String,
  email: { type: String, unique: true },
  mobile: { type: String, unique: true },
  password: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  pincode: String,
  image: String,
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["admin", "user"], default: "user" }
});

export default mongoose.model("User", userSchema);
