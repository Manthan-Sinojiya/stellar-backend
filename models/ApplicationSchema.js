import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    interviewDate: {
      type: String,
      required: true,
    },
    pdfFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * ✅ DEFAULT EXPORT (THIS FIXES YOUR ERROR)
 */
const Application = mongoose.model("Application", applicationSchema);
export default Application;
