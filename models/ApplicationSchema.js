import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  interviewDate: Date,
  pdfFileId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Application", ApplicationSchema);
