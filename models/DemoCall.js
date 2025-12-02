import mongoose from "mongoose";

const demoCallSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("DemoCall", demoCallSchema);
