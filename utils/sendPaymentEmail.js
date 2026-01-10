import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import Razorpay from "razorpay";
import axios from "axios";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const sendPaymentSuccessEmail = async (user, paymentDetails) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const assetsPath = path.join(process.cwd(), "assets");

  // -------------------------------
  // STEP 2: Define Email Content
  // -------------------------------
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background: #6d28d9; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">Payment Successful</h1>
      </div>
      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <p>Dear <b>${user.fullName}</b>,</p>
        <p>We have received your payment of <b>₹${paymentDetails.amount}.00</b> for the Stellar Campus Registration.</p>
        
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><b>Transaction Details:</b></p>
          <hr style="border: none; border-top: 1px solid #ddd;">
          <p style="margin: 5px 0; font-size: 13px;"><b>Payment ID:</b> ${paymentDetails.razorpay_payment_id}</p>
          <p style="margin: 5px 0; font-size: 13px;"><b>Order ID:</b> ${paymentDetails.razorpay_order_id}</p>
          <p style="margin: 5px 0; font-size: 13px;"><b>Date:</b> ${new Date().toLocaleString()}</p>
        </div>

        <p>Your admission documents are attached to this email:</p>
        <ul>
          <li><b>Entrance Examination (SEE) – Curriculum</b></li>
          <li><b>Interview Preparation Curriculum</b></li>
        </ul>

        <p>Please log in to the portal to start your Aptitude Assessment.</p>
        <p>Best Regards,<br/><b>Stellar Admissions Team</b></p>
      </div>
    </div>
  `;

  // -------------------------------
  // STEP 3: Define Attachments
  // -------------------------------
  const attachments = [
    {
      filename: "Stellar_SEE_Curriculum.pdf",
      path: path.join(assetsPath, "Stellar Entrance Examination (SEE) – Curriculum.pdf"),
    },
    {
      filename: "Stellar_Interview_Curriculum.pdf",
      path: path.join(assetsPath, "SEE Interview Curriculum.pdf"),
    },
  ];

  // -------------------------------
  // STEP 4: Send Email
  // -------------------------------
  await transporter.sendMail({
    from: '"Stellar Admissions" <admissions@stellarcampus.com>',
    to: user.email,
    subject: `Payment Confirmation & Curriculums - ${user.fullName}`,
    html: htmlContent,
    attachments,
  });

  console.log("Payment email sent successfully!");
};
