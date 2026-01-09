import mongoose from "mongoose";

const applicationProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    step1Completed: { type: Boolean, default: false },
    step2Completed: { type: Boolean, default: false },
    stepPaid:       { type: Boolean, default: false },
    step3Completed: { type: Boolean, default: false },
    step4Completed: { type: Boolean, default: false },
    step5Completed: { type: Boolean, default: false },

    interviewDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("ApplicationProgress", applicationProgressSchema);
