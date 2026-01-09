import asyncHandler from "express-async-handler";
import Razorpay from "razorpay";
import crypto from "crypto";
import ApplicationProgress from "../models/ApplicationProgress.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc Create a Razorpay Order
 * @route POST /api/applications/payment/create-order
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // Expecting amount in INR

  const options = {
    amount: Number(amount) * 100, // Amount in paise (e.g., 49900 for 499 INR)
    currency: "INR",
    receipt: `receipt_order_${req.user.id}_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Razorpay Order Creation Failed");
  }
});

/**
 * @desc Verify Razorpay Signature and Update Progress
 * @route POST /api/applications/payment/verify
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // 1. Generate signature to compare with Razorpay's signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // 2. Update the user's progress in the database
    // We use a new field "stepPaid" to track this
    await ApplicationProgress.findOneAndUpdate(
      { userId: req.user.id },
      { stepPaid: true }, // Ensure this field exists in your ApplicationProgress model
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } else {
    res.status(400);
    throw new Error("Payment verification failed: Invalid Signature");
  }
});