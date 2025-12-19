import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    title: String,
    organisation: String,
    certificateType: String,
    issueDate: Date,
    certificateUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("Certification", certificationSchema);
