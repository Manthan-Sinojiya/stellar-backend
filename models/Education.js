import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    level: {
      type: String,
      enum: ["10th", "12th"],
      required: true,
    },

    percentage: Number,
    cgpa: Number,

    marksheetUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Education", educationSchema);
