// import nodemailer from "nodemailer";
// import PDFDocument from "pdfkit";
// import path from "path";
// import fs from "fs";

// export const sendPaymentSuccessEmail = async (user) => {
//   // 1. Create PDF in memory
//   const doc = new PDFDocument({ size: "A4", margin: 50 });
//   const chunks = [];
//   doc.on("data", (chunk) => chunks.push(chunk));

//   // --- PDF BRANDING & HEADER ---
//   const logoPath = path.join(process.cwd(), "logo.png");
//   if (fs.existsSync(logoPath)) {
//     doc.image(logoPath, 50, 45, { width: 80 });
//   }

//   doc.fillColor("#1a1a1a").fontSize(20).text("OFFICIAL RECEIPT", 110, 57, { align: "right" });
//   doc.fontSize(10).fillColor("#777777").text(`Receipt No: ST-${Date.now().toString().slice(-6)}`, { align: "right" });
//   doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: "right" });

//   doc.moveDown(2);
//   doc.strokeColor("#dddddd").lineWidth(1).moveTo(50, 110).lineTo(550, 110).stroke();

//   // --- BILLING DETAILS ---
//   doc.moveDown(2);
//   doc.fillColor("#1a1a1a").fontSize(12).font("Helvetica-Bold").text("Billed To:", 50, 140);
//   doc.font("Helvetica").fontSize(11).text(user.fullName);
//   doc.text(user.email);
//   doc.text(user.mobile || "N/A");

//   // --- TABLE HEADER ---
//   const tableTop = 220;
//   doc.rect(50, tableTop, 500, 25).fill("#f5f5f5").stroke("#dddddd");
//   doc.fillColor("#333333").font("Helvetica-Bold").fontSize(10);
//   doc.text("Description", 60, tableTop + 8);
//   doc.text("Qty", 350, tableTop + 8);
//   doc.text("Amount", 450, tableTop + 8, { align: "right", width: 90 });

//   // --- TABLE ROW ---
//   const rowTop = tableTop + 30;
//   doc.fillColor("#000000").font("Helvetica").fontSize(11);
//   doc.text("Registration Fee - Stellar Campus Admission", 60, rowTop);
//   doc.text("1", 350, rowTop);
//   doc.font("Helvetica-Bold").text("₹ 2,000.00", 450, rowTop, { align: "right", width: 90 });

//   // --- SUMMARY ---
//   doc.moveDown(4);
//   doc.strokeColor("#eeeeee").lineWidth(1).moveTo(350, doc.y).lineTo(550, doc.y).stroke();
//   doc.moveDown(0.5);
//   doc.fontSize(12).text("Total Paid:", 350, doc.y, { continued: true });
//   doc.text(" ₹ 2,000.00", { align: "right" });

//   // --- FOOTER ---
//   doc.fontSize(10).fillColor("#999999").text(
//     "This is a computer-generated receipt and does not require a physical signature.",
//     50, 750, { align: "center", width: 500 }
//   );
//   doc.text("Stellar Campus | admissions@stellarcampus.com", { align: "center" });

//   doc.end();

//   // 2. Wait for PDF
//   const pdfBuffer = await new Promise((resolve) => {
//     doc.on("end", () => resolve(Buffer.concat(chunks)));
//   });

//   // 3. Configure Nodemailer (Using Business SMTP)
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com", // Or your business host: mail.stellarcampus.com
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   // 4. Professional HTML Email Template
//   const htmlContent = `
//     <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
//       <h2 style="color: #6d28d9; border-bottom: 2px solid #6d28d9; padding-bottom: 10px;">Payment Confirmation</h2>
//       <p>Dear <strong>${user.fullName}</strong>,</p>
//       <p>Thank you for choosing <strong>Stellar Campus</strong>. We are pleased to confirm that your registration fee payment has been successfully processed.</p>
      
//       <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
//         <table style="width: 100%; font-size: 14px;">
//           <tr><td><strong>Transaction Date:</strong></td><td>${new Date().toLocaleDateString()}</td></tr>
//           <tr><td><strong>Amount Received:</strong></td><td style="color: #16a34a; font-weight: bold;">₹ 2,000.00</td></tr>
//           <tr><td><strong>Status:</strong></td><td><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">SUCCESSFUL</span></td></tr>
//         </table>
//       </div>

//       <p>Please find your official payment receipt attached to this email for your records.</p>
      
//       <p style="margin-top: 30px;">Best Regards,<br>
//       <strong>Admissions Team</strong><br>
//       Stellar Campus</p>
//       <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
//       <p style="font-size: 11px; color: #999; text-align: center;">This is an automated message, please do not reply directly to this email.</p>
//     </div>
//   `;

//   await transporter.sendMail({
//     from: '"Stellar Admissions" <admissions@stellarcampus.com>',
//     to: user.email,
//     subject: `Payment Receipt: ${user.fullName} - Stellar Campus`,
//     html: htmlContent, // Sending HTML instead of plain text
//     attachments: [
//       {
//         filename: `Stellar_Receipt_${user.fullName.replace(/\s/g, '_')}.pdf`,
//         content: pdfBuffer,
//       },
//     ],
//   });
// };

import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export const sendPaymentSuccessEmail = async (user) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // --- 1. HEADER IMAGE (Draw first) ---
  const bgPath = path.join(process.cwd(), "header-bg.png");
  if (fs.existsSync(bgPath)) {
    // Spans full width at the top
    doc.image(bgPath, 0, 0, { width: 612 }); // 612 is the full width of A4 in points
  }

  // --- 2. LOGO OVERLAY ---
  const logoPath = path.join(process.cwd(), "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 70 });
  }

  // --- 3. HEADER TEXT (Positioned over the image) ---
  doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold").text("OFFICIAL RECEIPT", 110, 50, { align: "right" });
  doc.fontSize(10).fillColor("#f0f0f0").font("Helvetica").text(`Receipt No: ST-${Date.now().toString().slice(-6)}`, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: "right" });

  // --- 4. BILLING SECTION (Pushed down to avoid overlap with background image) ---
  // We start this at y=250 to clear the building in your image
  const billingTop = 260; 
  doc.fillColor("#1a1a1a").fontSize(13).font("Helvetica-Bold").text("Billed To:", 50, billingTop);
  
  doc.fillColor("#444444").font("Helvetica").fontSize(11);
  doc.text(user.fullName || "Valued Student", 50, billingTop + 20);
  doc.text(user.email || "N/A");
  doc.text(user.mobile || "N/A");

  // --- 5. ITEMS TABLE ---
  const tableTop = 360; // Further down to allow breathing room
  
  // Table Header
  doc.rect(50, tableTop, 500, 25).fill("#6d28d9"); // Stellar Purple
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);
  doc.text("Description", 65, tableTop + 8);
  doc.text("Qty", 350, tableTop + 8);
  doc.text("Amount", 450, tableTop + 8, { align: "right", width: 90 });

  // Table Row
  const rowTop = tableTop + 35;
  doc.fillColor("#333333").font("Helvetica").fontSize(11);
  doc.text("Registration Fee - Stellar Campus Admission", 65, rowTop);
  doc.text("1", 350, rowTop);
  doc.font("Helvetica-Bold").fillColor("#000000").text("₹ 2,000.00", 450, rowTop, { align: "right", width: 90 });

  // --- 6. SUMMARY SECTION ---
  const summaryTop = rowTop + 40;
  doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, summaryTop).lineTo(550, summaryTop).stroke();
  
  doc.moveDown(2);
  doc.fontSize(14).fillColor("#1a1a1a").font("Helvetica-Bold").text("Total Paid:", 350, doc.y, { continued: true });
  doc.fillColor("#16a34a").text(" ₹ 2,000.00", { align: "right" });

  // --- 7. PAID STAMP (Moved to Bottom Right) ---
  doc.opacity(0.8);
  doc.save();
  doc.rotate(-15, { origin: [460, 680] }); 
  doc.rect(400, 660, 120, 50).lineWidth(3).stroke("#16a34a");
  doc.fillColor("#16a34a").font("Helvetica-Bold").fontSize(25).text("PAID", 415, 672);
  doc.restore();
  doc.opacity(1.0);

  // --- 8. FOOTER ---
  doc.fontSize(9).fillColor("#999999").font("Helvetica").text(
    "This is a digitally verified receipt. No physical signature is required.",
    50, 780, { align: "center", width: 500 }
  );

  doc.end();

  const pdfBuffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // --- 9. EMAIL TRANSPORT ---
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Stellar Admissions" <admissions@stellarcampus.com>',
    to: user.email,
    subject: `Admission Receipt: ${user.fullName}`,
    html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Payment Received</h2>
            <p>Hi ${user.fullName}, your payment of ₹2,000.00 is successful. Please find your receipt attached.</p>
           </div>`,
    attachments: [
      {
        filename: `Receipt_${user.fullName.replace(/\s/g, '_')}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};