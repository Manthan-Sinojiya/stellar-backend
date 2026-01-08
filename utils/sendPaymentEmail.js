import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export const sendPaymentSuccessEmail = async (user) => {
  // 1. Create PDF in memory
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];
  
  doc.on("data", (chunk) => chunks.push(chunk));

  // --- PDF CONTENT ---
  // Logo (Assuming logo.png is in your server root)
  const logoPath = path.join(process.cwd(), "stellar-logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 100 });
  }

  doc.fillColor("#444444").fontSize(20).text("Payment Receipt", 110, 57, { align: "right" });
  doc.moveDown();
  doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

  doc.fontSize(12).fillColor("#000000").text(`Hello ${user.fullName},`, 50, 150);
  doc.text("Your registration and fee payment has been successfully processed.");

  doc.moveDown();
  doc.fontSize(14).text("Details:", { underline: true });
  doc.fontSize(12).text(`Email: ${user.email}`);
  doc.text(`Phone: ${user.mobile || "N/A"}`);
  doc.text(`Amount Paid: ₹ 2000.00`);
  doc.text(`Status: Completed`, { stroke: true });

  doc.moveDown(2);
  doc.text("Thank you for joining Stellar.", { align: "center", italic: true });
  doc.end();

  // 2. Wait for PDF to finish
  const pdfBuffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // 3. Configure Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 4. Send Mail
  await transporter.sendMail({
    from: '"Stellar Admin" <admissions@stellarcampus.com>',
    to: user.email,
    subject: "Payment Confirmation - Stellar",
    text: `Hi ${user.fullName}, your payment of ₹2000 is complete.`,
    attachments: [
      {
        filename: `Receipt_${user.fullName}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};