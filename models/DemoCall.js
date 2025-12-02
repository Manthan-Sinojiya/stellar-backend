import mongoose from "mongoose";

const demoCallSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: false },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("DemoCall", demoCallSchema);
