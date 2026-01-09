import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: String,
  email: String,
  mobile: String,
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String, required: true },
  amount: { type: Number, default: 2000 },
  status: { type: String, default: "captured" },
  paymentDate: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);