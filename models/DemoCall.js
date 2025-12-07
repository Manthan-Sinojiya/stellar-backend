import mongoose from "mongoose";

const demoCallSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String },
    message: { type: String },

    // ADD THIS FIELD
    status: {
      type: String,
      enum: ["not_contacted", "called"],
      default: "not_contacted",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DemoCall", demoCallSchema);
