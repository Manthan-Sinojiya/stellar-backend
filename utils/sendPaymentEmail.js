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

// import nodemailer from "nodemailer";
// import PDFDocument from "pdfkit";
// import path from "path";
// import fs from "fs";

// export const sendPaymentSuccessEmail = async (user) => {
//   const doc = new PDFDocument({ size: "A4", margin: 50 });
//   const chunks = [];
//   doc.on("data", (chunk) => chunks.push(chunk));

//   // --- 1. BACKGROUND HEADER IMAGE ---
//   // Drawn first so it sits behind the logo/text
//   const bgPath = path.join(process.cwd(), "header-bg.png");
//   if (fs.existsSync(bgPath)) {
//     // This spans the top of the page
//     doc.image(bgPath, 0, 0, { width: 600 }); 
//   }

//   // --- 2. LOGO OVERLAY ---
//   // Drawn after background to appear on top
//   const logoPath = path.join(process.cwd(), "logo.png");
//   if (fs.existsSync(logoPath)) {
//     doc.image(logoPath, 50, 30, { width: 70 });
//   }

//   // Header Text (White/Light if background is dark)
//   doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text("OFFICIAL RECEIPT", 110, 45, { align: "right" });
//   doc.fontSize(10).fillColor("#eeeeee").font("Helvetica").text(`Receipt No: ST-${Date.now().toString().slice(-6)}`, { align: "right" });
//   doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: "right" });

//   doc.moveDown(4); // Move cursor below the header background area

//   // --- 3. BILLING DETAILS ---
//   doc.fillColor("#1a1a1a").fontSize(12).font("Helvetica-Bold").text("Billed To:", 50, 160);
//   doc.font("Helvetica").fontSize(11).fillColor("#333333").text(user.fullName);
//   doc.text(user.email);
//   doc.text(user.mobile || "N/A");

//   // --- 4. ITEMS TABLE ---
//   const tableTop = 240;
//   doc.rect(50, tableTop, 500, 25).fill("#6d28d9"); // Purple Header to match your UI
//   doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);
//   doc.text("Description", 65, tableTop + 8);
//   doc.text("Qty", 350, tableTop + 8);
//   doc.text("Amount", 450, tableTop + 8, { align: "right", width: 90 });

//   const rowTop = tableTop + 35;
//   doc.fillColor("#000000").font("Helvetica").fontSize(11);
//   doc.text("Registration Fee - Stellar Campus Admission", 65, rowTop);
//   doc.text("1", 350, rowTop);
//   doc.font("Helvetica-Bold").text("₹ 2,000.00", 450, rowTop, { align: "right", width: 90 });

//   // Summary Line
//   doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, rowTop + 25).lineTo(550, rowTop + 25).stroke();
//   doc.moveDown(2);
//   doc.fontSize(14).fillColor("#1a1a1a").text("Total Paid:", 350, doc.y, { continued: true });
//   doc.fillColor("#16a34a").text(" ₹ 2,000.00", { align: "right" });

//   // --- 5. OFFICIAL STAMP ---
//   // Positioning a "PAID" stamp image if you have one, or creating a vector stamp
//   doc.opacity(0.8);
//   doc.save();
//   doc.rotate(-15, { origin: [450, 450] }); // Slanted stamp look
//   doc.rect(400, 430, 120, 50).lineWidth(3).stroke("#16a34a");
//   doc.fillColor("#16a34a").font("Helvetica-Bold").fontSize(25).text("PAID", 415, 442);
//   doc.restore();
//   doc.opacity(1.0);

//   // --- 6. FOOTER ---
//   doc.fontSize(9).fillColor("#999999").font("Helvetica").text(
//     "This is a digitally verified receipt issued by Stellar Campus. No physical signature is required.",
//     50, 740, { align: "center", width: 500 }
//   );
//   doc.fillColor("#6d28d9").text("www.stellarcampus.com | Support: admissions@stellarcampus.com", { align: "center" });

//   doc.end();

//   const pdfBuffer = await new Promise((resolve) => {
//     doc.on("end", () => resolve(Buffer.concat(chunks)));
//   });

//   // --- 7. EMAIL CONFIG ---
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const htmlContent = `
//     <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
//       <div style="background: #6d28d9; padding: 20px; text-align: center;">
//         <h1 style="color: white; margin: 0; font-size: 24px;">Payment Successful</h1>
//       </div>
//       <div style="padding: 30px;">
//         <p>Hi <b>${user.fullName}</b>,</p>
//         <p>We've received your payment of <b>₹2,000.00</b> for the Stellar Campus registration. Your admission process is now moving to the next stage.</p>
//         <div style="border-left: 4px solid #6d28d9; padding-left: 15px; margin: 20px 0; background: #f8f7ff;">
//           <p style="margin: 5px 0;"><b>Transaction ID:</b> ST-${Date.now().toString().slice(-8)}</p>
//           <p style="margin: 5px 0;"><b>Status:</b> Completed</p>
//         </div>
//         <p>Your official receipt is attached below.</p>
//         <p>Best Regards,<br><b>Stellar Admissions Team</b></p>
//       </div>
//     </div>
//   `;

//   await transporter.sendMail({
//     from: '"Stellar Admissions" <admissions@stellarcampus.com>',
//     to: user.email,
//     subject: `Admission Receipt: ${user.fullName}`,
//     html: htmlContent,
//     attachments: [
//       {
//         filename: `Stellar_Receipt_${user.fullName.replace(/\s/g, '_')}.pdf`,
//         content: pdfBuffer,
//       },
//     ],
//   });
// };

// import nodemailer from "nodemailer";
// import PDFDocument from "pdfkit";
// import path from "path";
// import fs from "fs";

// export const sendPaymentSuccessEmail = async (user) => {
//   const doc = new PDFDocument({ size: "A4", margin: 50 });
//   const chunks = [];

//   doc.on("data", (chunk) => chunks.push(chunk));

//   const assetsPath = path.join(process.cwd(), "assets");

//   /* --------------------------------------------------
//      HEADER BACKGROUND
//   -------------------------------------------------- */
//   const bgPath = path.join(assetsPath, "header-bg.png");
//   if (fs.existsSync(bgPath)) {
//     doc.image(bgPath, 0, 0, { width: 600 });
//   } else {
//     doc.rect(0, 0, 600, 120).fill("#6d28d9");
//   }

//   /* --------------------------------------------------
//      LOGO
//   -------------------------------------------------- */
//   const logoPath = path.join(assetsPath, "logo.png");
//   if (fs.existsSync(logoPath)) {
//     doc.image(logoPath, 50, 30, { width: 70 });
//   }

//   /* --------------------------------------------------
//      HEADER TEXT
//   -------------------------------------------------- */
//   doc
//     .fillColor("#ffffff")
//     .font("Helvetica-Bold")
//     .fontSize(20)
//     .text("STELLAR INSTITUTE OF TECHNOLOGY", 130, 35, {
//       align: "right",
//     });

//   doc
//     .fontSize(12)
//     .font("Helvetica")
//     .text("OFFICIAL PAYMENT RECEIPT", { align: "right" });

//   doc
//     .fontSize(10)
//     .fillColor("#e5e5e5")
//     .text(`Receipt No: ST-${Date.now().toString().slice(-6)}`, {
//       align: "right",
//     })
//     .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, {
//       align: "right",
//     });

//   doc.moveDown(5);

//   /* --------------------------------------------------
//      BILLING DETAILS
//   -------------------------------------------------- */
//   doc
//     .fillColor("#1a1a1a")
//     .font("Helvetica-Bold")
//     .fontSize(12)
//     .text("Billed To:", 50, 160);

//   doc
//     .font("Helvetica")
//     .fontSize(11)
//     .fillColor("#333")
//     .text(user.fullName)
//     .text(user.email)
//     .text(user.mobile || "N/A");

//   /* --------------------------------------------------
//      PAYMENT TABLE
//   -------------------------------------------------- */
//   const tableTop = 240;

//   doc.rect(50, tableTop, 500, 30).fill("#6d28d9");

//   doc
//     .fillColor("#ffffff")
//     .font("Helvetica-Bold")
//     .fontSize(11)
//     .text("Description", 65, tableTop + 9)
//     .text("Qty", 350, tableTop + 9)
//     .text("Amount", 450, tableTop + 9, {
//       width: 90,
//       align: "right",
//     });

//   const rowTop = tableTop + 45;

//   doc
//     .fillColor("#000")
//     .font("Helvetica")
//     .fontSize(11)
//     .text("Registration Fee – Campus Admission", 65, rowTop)
//     .text("1", 350, rowTop);

//   doc
//     .font("Helvetica-Bold")
//     .text("₹ 2,000.00", 450, rowTop, {
//       width: 90,
//       align: "right",
//     });

//   doc
//     .strokeColor("#ddd")
//     .lineWidth(1)
//     .moveTo(50, rowTop + 30)
//     .lineTo(550, rowTop + 30)
//     .stroke();

//   doc
//     .font("Helvetica-Bold")
//     .fontSize(14)
//     .fillColor("#1a1a1a")
//     .text("Total Paid:", 350, rowTop + 45, { continued: true });

//   doc
//     .fillColor("#16a34a")
//     .text(" ₹ 2,000.00", { align: "right" });

//   /* --------------------------------------------------
//      OFFICIAL INSTITUTE STAMP
//   -------------------------------------------------- */
//   doc.save();
//   doc.opacity(0.15);
//   doc.rotate(-20, { origin: [420, 470] });

//   doc.circle(420, 470, 70).lineWidth(3).stroke("#15803d");
//   doc.circle(420, 470, 58).lineWidth(1).stroke("#15803d");

//   doc
//     .fillColor("#15803d")
//     .font("Helvetica-Bold")
//     .fontSize(10)
//     .text(
//       "STELLAR INSTITUTE OF TECHNOLOGY",
//       350,
//       440,
//       { width: 140, align: "center" }
//     );

//   doc
//     .fontSize(22)
//     .text("PAID", 380, 465, {
//       width: 80,
//       align: "center",
//     });

//   doc
//     .fontSize(8)
//     .text("OFFICIAL RECEIPT", 360, 500, {
//       width: 120,
//       align: "center",
//     });

//   doc.restore();
//   doc.opacity(1);

//   /* --------------------------------------------------
//      FOOTER
//   -------------------------------------------------- */
//   doc
//     .fontSize(9)
//     .fillColor("#777")
//     .text(
//       "This is a digitally generated receipt issued by Stellar Institute of Technology. No signature required.",
//       50,
//       740,
//       { width: 500, align: "center" }
//     );

//   doc
//     .fillColor("#6d28d9")
//     .text(
//       "www.stellarinstitute.edu | admissions@stellarinstitute.edu",
//       { align: "center" }
//     );

//   doc.end();

//   const pdfBuffer = await new Promise((resolve) => {
//     doc.on("end", () => resolve(Buffer.concat(chunks)));
//   });

//   /* --------------------------------------------------
//      EMAIL TRANSPORTER
//   -------------------------------------------------- */
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const htmlContent = `
//     <div style="font-family:sans-serif;max-width:600px;margin:auto;border-radius:12px;overflow:hidden;border:1px solid #eee">
//       <div style="background:#6d28d9;padding:20px;text-align:center">
//         <h1 style="color:#fff;margin:0">Payment Successful</h1>
//       </div>
//       <div style="padding:30px;color:#333">
//         <p>Hi <b>${user.fullName}</b>,</p>
//         <p>
//           We have successfully received your payment of <b>₹2,000</b>.
//         </p>
//         <p>
//           Your <b>official receipt</b> and the 
//           <b>Stellar Entrance Examination (SEE) – Curriculum</b>
//           are attached for your reference.
//         </p>
//         <p>
//           Best Regards,<br/>
//           <b>Stellar Admissions Team</b>
//         </p>
//       </div>
//     </div>
//   `;

//   await transporter.sendMail({
//     from: '"Stellar Admissions" <admissions@stellarinstitute.edu>',
//     to: user.email,
//     subject: `Admission Receipt – ${user.fullName}`,
//     html: htmlContent,
//     attachments: [
//       {
//         filename: `Stellar_Receipt_${user.fullName.replace(/\s/g, "_")}.pdf`,
//         content: pdfBuffer,
//       },
//       {
//         filename: "Stellar_Entrance_Examination_SEE_Curriculum.pdf",
//         path: path.join(assetsPath, "SEE_Curriculum.pdf"),
//       },
//     ],
//   });
// };

// import nodemailer from "nodemailer";
// import PDFDocument from "pdfkit";
// import path from "path";
// import fs from "fs";

// export const sendPaymentSuccessEmail = async (user) => {
//   /* ==================================================
//      CREATE PDF
//   ================================================== */
//   const doc = new PDFDocument({ size: "A4", margin: 50 });
//   const chunks = [];

//   doc.on("data", (chunk) => chunks.push(chunk));

//   const assetsPath = path.join(process.cwd(), "assets");

//   /* ---------- HEADER BACKGROUND ---------- */
//   const bgPath = path.join(assetsPath, "header-bg.png");
//   if (fs.existsSync(bgPath)) {
//     doc.image(bgPath, 0, 0, { width: 595 });
//   } else {
//     doc.rect(0, 0, 595, 140).fill("#6d28d9");
//   }

//   /* ---------- LOGO ---------- */
//   const logoPath = path.join(assetsPath, "logo.png");
//   if (fs.existsSync(logoPath)) {
//     doc.image(logoPath, 50, 35, { width: 65 });
//   }

//   /* ---------- HEADER TEXT ---------- */
//   doc
//     .fillColor("#ffffff")
//     .font("Helvetica-Bold")
//     .fontSize(20)
//     .text("STELLAR INSTITUTE OF TECHNOLOGY", 130, 40, {
//       width: 400,
//       align: "right",
//     });

//   doc
//     .fontSize(12)
//     .font("Helvetica")
//     .text("OFFICIAL PAYMENT RECEIPT", {
//       width: 400,
//       align: "right",
//     });

//   doc
//     .fontSize(10)
//     .fillColor("#e5e7eb")
//     .text(`Receipt No: ST-${Date.now().toString().slice(-6)}`, {
//       width: 400,
//       align: "right",
//     })
//     .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, {
//       width: 400,
//       align: "right",
//     });

//   /* ---------- BILLING DETAILS ---------- */
//   doc
//     .fillColor("#111")
//     .font("Helvetica-Bold")
//     .fontSize(12)
//     .text("Billed To:", 50, 180);

//   doc
//     .font("Helvetica")
//     .fontSize(11)
//     .fillColor("#333")
//     .text(user.fullName, 50, 200)
//     .text(user.email)
//     .text(user.mobile || "N/A");

//   /* ---------- PAYMENT TABLE ---------- */
//   const tableTop = 260;

//   doc.rect(50, tableTop, 495, 34).fill("#6d28d9");

//   doc
//     .fillColor("#ffffff")
//     .font("Helvetica-Bold")
//     .fontSize(11)
//     .text("Description", 65, tableTop + 11)
//     .text("Qty", 360, tableTop + 11)
//     .text("Amount", 445, tableTop + 11, {
//       width: 90,
//       align: "right",
//     });

//   const rowY = tableTop + 50;

//   doc
//     .fillColor("#000")
//     .font("Helvetica")
//     .fontSize(11)
//     .text("Registration Fee – Campus Admission", 65, rowY, {
//       width: 270,
//     })
//     .text("1", 360, rowY);

//   doc
//     .font("Helvetica-Bold")
//     .text("₹ 2,000.00", 445, rowY, {
//       width: 90,
//       align: "right",
//     });

//   doc
//     .strokeColor("#e5e7eb")
//     .lineWidth(1)
//     .moveTo(50, rowY + 30)
//     .lineTo(545, rowY + 30)
//     .stroke();

//   /* ---------- TOTAL ---------- */
//   doc
//     .font("Helvetica-Bold")
//     .fontSize(14)
//     .fillColor("#111")
//     .text("Total Paid:", 330, rowY + 45);

//   doc
//     .fillColor("#16a34a")
//     .text("₹ 2,000.00", 445, rowY + 45, {
//       width: 90,
//       align: "right",
//     });

//   /* ---------- PAID STAMP ---------- */
//   doc.save();
//   doc.opacity(0.12);
//   doc.rotate(-20, { origin: [420, 520] });

//   doc.circle(420, 520, 70).lineWidth(3).stroke("#15803d");
//   doc.circle(420, 520, 58).lineWidth(1).stroke("#15803d");

//   doc
//     .fillColor("#15803d")
//     .font("Helvetica-Bold")
//     .fontSize(10)
//     .text(
//       "STELLAR INSTITUTE OF TECHNOLOGY",
//       350,
//       485,
//       { width: 140, align: "center" }
//     );

//   doc
//     .fontSize(22)
//     .text("PAID", 380, 515, {
//       width: 80,
//       align: "center",
//     });

//   doc
//     .fontSize(8)
//     .text("OFFICIAL RECEIPT", 360, 555, {
//       width: 120,
//       align: "center",
//     });

//   doc.restore();
//   doc.opacity(1);

//   /* ---------- FOOTER ---------- */
//   doc
//     .fontSize(9)
//     .fillColor("#777")
//     .text(
//       "This is a digitally generated receipt issued by Stellar Institute of Technology. No signature required.",
//       50,
//       740,
//       { width: 495, align: "center" }
//     );

//   doc
//     .fillColor("#6d28d9")
//     .text(
//       "www.stellarinstitute.edu | admissions@stellarinstitute.edu",
//       { align: "center" }
//     );

//   doc.end();

//   const pdfBuffer = await new Promise((resolve) => {
//     doc.on("end", () => resolve(Buffer.concat(chunks)));
//   });

//   /* ==================================================
//      EMAIL
//   ================================================== */
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const htmlContent = `
//     <div style="font-family:sans-serif;max-width:600px;margin:auto;border-radius:12px;overflow:hidden;border:1px solid #eee">
//       <div style="background:#6d28d9;padding:20px;text-align:center">
//         <h1 style="color:#fff;margin:0">Payment Successful</h1>
//       </div>
//       <div style="padding:30px;color:#333">
//         <p>Hi <b>${user.fullName}</b>,</p>
//         <p>
//           We have successfully received your payment of <b>₹2,000</b>.
//         </p>
//         <p>
//           Your <b>official receipt</b> and the 
//           <b>Stellar Entrance Examination (SEE) – Curriculum</b>
//           are attached for your reference.
//         </p>
//         <p>
//           Best Regards,<br/>
//           <b>Stellar Admissions Team</b>
//         </p>
//       </div>
//     </div>
//   `;

//   await transporter.sendMail({
//     from: '"Stellar Admissions" <admissions@stellarinstitute.edu>',
//     to: user.email,
//     subject: `Admission Receipt – ${user.fullName}`,
//     html: htmlContent,
//     attachments: [
//       {
//         filename: `Stellar_Receipt_${user.fullName.replace(/\s/g, "_")}.pdf`,
//         content: pdfBuffer,
//       },
//       {
//         filename: "Stellar_Entrance_Examination_SEE_Curriculum.pdf",
//         path: path.join(assetsPath, "SEE_Curriculum.pdf"),
//       },
//     ],
//   });
// };

// import nodemailer from "nodemailer";
// import PDFDocument from "pdfkit";
// import path from "path";
// import fs from "fs";

// export const sendPaymentSuccessEmail = async (user) => {
//   /* ==================================================
//      CREATE PDF (Using New Branded Header Style)
//   ================================================== */
//   const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
//   const chunks = [];

//   doc.on("data", (chunk) => chunks.push(chunk));

//   const COLORS = {
//     primary: "#0f172a",
//     accent: "#6d28d9", // Keeping your purple brand color
//     textDark: "#1e293b",
//     textLight: "#64748b",
//     divider: "#e2e8f0",
//   };

//   // Adjusting asset paths based on your provided reference (process.cwd)
//   const assetsPath = path.join(process.cwd(), "assets");
//   // const logoPath = path.join(assetsPath, "logo.png");
//   const headerBgPath = path.join(assetsPath, "header-bg.jpg");

//   /**
//    * Helper Function to draw the Branded Header (Refactored from your reference)
//    */
//   const drawHeader = () => {
//     const headerHeight = 115;
//     const pageWidth = 595.28;

//     // 1. Background
//     if (fs.existsSync(headerBgPath)) {
//       doc.image(headerBgPath, 0, 0, { width: pageWidth, height: headerHeight });
//     } else {
//       doc.rect(0, 0, pageWidth, headerHeight).fill(COLORS.primary);
//     }

//     // 3. Title & Metadata
//     doc
//       .fillColor("#1916eeff")
//       .font("Helvetica-Bold")
//       .fontSize(20)
//       .text("PAYMENT RECEIPT", 115, 35, { characterSpacing: 1 });

//     doc.fillColor("#ffffff").font("Helvetica").fontSize(8);
//     doc.text(`RECEIPT NO: ST-${Date.now().toString().slice(-6)}`, 350, 75, {
//       align: "right",
//       width: 205,
//     });
//     doc.text(`DATE: ${new Date().toLocaleDateString("en-IN")}`, 350, 87, {
//       align: "right",
//       width: 205,
//     });
//   };

//   // Initialize Header
//   drawHeader();

//   /* ---------- BILLING DETAILS ---------- */
//   doc
//     .fillColor(COLORS.textLight)
//     .font("Helvetica-Bold")
//     .fontSize(10)
//     .text("BILLED TO", 50, 160);

//   doc
//     .fillColor(COLORS.textDark)
//     .font("Helvetica")
//     .fontSize(12)
//     .text(user.fullName, 50, 175)
//     .fontSize(10)
//     .text(user.email)
//     .text(user.mobile || "");

//   /* ---------- PAYMENT TABLE ---------- */
//   const tableTop = 240;

//   // Table Header
//   doc.rect(50, tableTop, 495, 30).fill(COLORS.primary);
//   doc
//     .fillColor("#ffffff")
//     .font("Helvetica-Bold")
//     .fontSize(10)
//     .text("DESCRIPTION", 65, tableTop + 10)
//     .text("QTY", 360, tableTop + 10)
//     .text("AMOUNT", 445, tableTop + 10, { width: 90, align: "right" });

//   // Table Row
//   const rowY = tableTop + 45;
//   doc
//     .fillColor(COLORS.textDark)
//     .font("Helvetica")
//     .fontSize(11)
//     .text("Registration Fee – Campus Admission", 65, rowY)
//     .text("1", 360, rowY);

//   doc
//     .font("Helvetica-Bold")
//     .text("₹ 2,000.00", 445, rowY, { width: 90, align: "right" });

//   // Divider Line
//   doc
//     .strokeColor(COLORS.divider)
//     .lineWidth(1)
//     .moveTo(50, rowY + 25)
//     .lineTo(545, rowY + 25)
//     .stroke();

//   /* ---------- TOTAL ---------- */
//   doc
//     .font("Helvetica-Bold")
//     .fontSize(14)
//     .fillColor(COLORS.textDark)
//     .text("Total Paid:", 330, rowY + 45);

//   doc
//     .fillColor("#16a34a") // Success Green
//     .text("₹ 2,000.00", 445, rowY + 45, { width: 90, align: "right" });

//   /* ---------- PAID STAMP ---------- */
//   doc.save();
//   doc.opacity(0.12);
//   doc.rotate(-20, { origin: [420, 520] });

//   doc.circle(420, 520, 70).lineWidth(3).stroke("#15803d");
//   doc.circle(420, 520, 58).lineWidth(1).stroke("#15803d");

//   doc
//     .fillColor("#15803d")
//     .font("Helvetica-Bold")
//     .fontSize(10)
//     .text(
//       "STELLAR INSTITUTE OF TECHNOLOGY",
//       350,
//       485,
//       { width: 140, align: "center" }
//     );

//   doc
//     .fontSize(22)
//     .text("PAID", 380, 515, {
//       width: 80,
//       align: "center",
//     });

//   doc
//     .fontSize(8)
//     .text("OFFICIAL RECEIPT", 360, 555, {
//       width: 120,
//       align: "center",
//     });

//   doc.restore();
//   doc.opacity(1);

//   /* ---------- FOOTER ---------- */
//   doc
//     .fontSize(9)
//     .fillColor("#777")
//     .text(
//       "This is a digitally generated receipt issued by Stellar Institute of Technology. No signature required.",
//       50,
//       740,
//       { width: 495, align: "center" }
//     );

//   doc
//     .fillColor("#6d28d9")
//     .text(
//       "www.stellarcampus.com | admissions@stellarcampus.com",
//       { align: "center" }
//     );

//   doc.end();

//   const pdfBuffer = await new Promise((resolve) => {
//     doc.on("end", () => resolve(Buffer.concat(chunks)));
//   });

//   /* ==================================================
//      EMAIL SENDING
//   ================================================== */
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const htmlContent = `
//     <div style="font-family:sans-serif;max-width:600px;margin:auto;border-radius:12px;overflow:hidden;border:1px solid #eee">
//       <div style="background:${COLORS.accent};padding:20px;text-align:center">
//         <h1 style="color:#fff;margin:0">Payment Successful</h1>
//       </div>
//       <div style="padding:30px;color:#333">
//         <p>Hi <b>${user.fullName}</b>,</p>
//         <p>
//           We have successfully received your payment of <b>₹2,000</b>.
//         </p>
//         <p>
//           Your <b>official receipt</b> and the 
//           <b>Stellar Entrance Examination (SEE) – Curriculum</b>
//           are attached for your reference.
//         </p>
//         <p>
//           Best Regards,<br/>
//           <b>Stellar Admissions Team</b>
//         </p>
//         </div>
//     </div>
//   `;

//   await transporter.sendMail({
//     from: '"Stellar Admissions" <admissions@stellarinstitute.edu>',
//     to: user.email,
//     subject: `Admission Receipt – ${user.fullName}`,
//     html: htmlContent,
//     attachments: [
//       {
//         filename: `Stellar_Receipt_${user.fullName.replace(/\s/g, "_")}.pdf`,
//         content: pdfBuffer,
//       },
//       {
//               filename: "Stellar_Entrance_Examination_SEE_Curriculum.pdf",
//               path: path.join(assetsPath, "SEE_Curriculum.pdf"),
//             },
//     ],
//   });
// };

import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export const sendPaymentSuccessEmail = async (user) => {
  /* ==================================================
     CREATE PDF
  ================================================== */
  const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  const COLORS = {
    primary: "#0f172a",
    accent: "#6d28d9", 
    logoPurple: "#9333ea", // Extracted purple from your logo
    textDark: "#1e293b",
    textLight: "#64748b",
    divider: "#e2e8f0",
    stampBlue: "#1e40af", // New Blue color for stamp
  };

  const assetsPath = path.join(process.cwd(), "assets");
  const headerBgPath = path.join(assetsPath, "header-bg.jpg");

  const drawHeader = () => {
    const headerHeight = 115;
    const pageWidth = 595.28;

    if (fs.existsSync(headerBgPath)) {
      doc.image(headerBgPath, 0, 0, { width: pageWidth, height: headerHeight });
    } else {
      doc.rect(0, 0, pageWidth, headerHeight).fill(COLORS.primary);
    }

    doc
.fillColor(COLORS.logoPurple)      .font("Helvetica-Bold")
      .fontSize(20)
      .text("PAYMENT RECEIPT", 115, 35, { characterSpacing: 1 });

    doc.fillColor("#ffffffff").font("Helvetica").fontSize(8);
    doc.text(`RECEIPT NO: ST-${Date.now().toString().slice(-6)}`, 350, 75, {
      align: "right",
      width: 205,
    });
    doc.text(`DATE: ${new Date().toLocaleDateString("en-IN")}`, 350, 87, {
      align: "right",
      width: 205,
    });
  };

  drawHeader();

  /* ---------- BILLING DETAILS ---------- */
  doc
    .fillColor(COLORS.textLight)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("BILLED TO", 50, 160);

  doc
    .fillColor(COLORS.textDark)
    .font("Helvetica")
    .fontSize(12)
    .text(user.fullName, 50, 175)
    .fontSize(10)
    .text(user.email)
    .text(user.mobile || "");

  /* ---------- PAYMENT TABLE ---------- */
  const tableTop = 240;
  doc.rect(50, tableTop, 495, 30).fill(COLORS.primary);
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("DESCRIPTION", 65, tableTop + 10)
    .text("QTY", 360, tableTop + 10)
    .text("AMOUNT", 445, tableTop + 10, { width: 90, align: "right" });

  const rowY = tableTop + 45;
  doc
    .fillColor(COLORS.textDark)
    .font("Helvetica")
    .fontSize(11)
    .text("Registration Fee – Campus Admission", 65, rowY)
    .text("1", 360, rowY);

  doc.font("Helvetica-Bold").text("₹ 2,000.00", 445, rowY, { width: 90, align: "right" });

  doc.strokeColor(COLORS.divider).lineWidth(1).moveTo(50, rowY + 25).lineTo(545, rowY + 25).stroke();

  /* ---------- TOTAL ---------- */
  doc.font("Helvetica-Bold").fontSize(14)
     .fillColor(COLORS.textDark).text("Total Paid:", 330, rowY + 45);
  doc.fillColor("#16a34a").text("₹ 2,000.00", 445, rowY + 45, { width: 90, align: "right" });

  /* ---------- PAID STAMP (UPDATED TO BLUE) ---------- */
  doc.save();
  doc.opacity(0.15); // Increased slightly for visibility
  doc.rotate(-20, { origin: [420, 520] });

  doc.circle(420, 520, 70).lineWidth(3).stroke(COLORS.stampBlue);
  doc.circle(420, 520, 58).lineWidth(1).stroke(COLORS.stampBlue);

  doc
    .fillColor(COLORS.stampBlue)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("STELLAR INSTITUTE OF TECHNOLOGY", 350, 485, { width: 140, align: "center" });

  doc.fontSize(22).text("PAID", 380, 515, { width: 80, align: "center" });
  doc.fontSize(8).text("APPLICATION RECEIPT", 360, 555, { width: 120, align: "center" });

  doc.restore();

  /* ---------- FOOTER ---------- */
  doc.fontSize(9).fillColor("#777").text("This is a digitally generated receipt. No signature required.", 50, 740, { width: 495, align: "center" });
  doc.fillColor(COLORS.accent).text("www.stellarcampus.com | admissions@stellarcampus.com", { align: "center" });

  doc.end();

  const pdfBuffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  /* ==================================================
     EMAIL SENDING
  ================================================== */
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;border-radius:12px;border:1px solid #eee;overflow:hidden">
      <div style="background:${COLORS.accent};padding:20px;text-align:center">
        <h1 style="color:#fff;margin:0">Payment Successful</h1>
      </div>
      <div style="padding:30px;color:#333;line-height:1.6">
        <p>Hi <b>${user.fullName}</b>,</p>
        <p>We have successfully received your payment of <b>₹2,000</b>.</p>
        <p>Please find the following documents attached to this email:</p>
        <ul>
          <li><b>Official Payment Receipt</b></li>
          <li><b>Stellar Entrance Examination (SEE) Curriculum</b></li>
          <li><b>Interview Preparation Curriculum</b></li>
        </ul>
        <p>Review these documents carefully to prepare for the next steps of your admission process.</p>
        <p>Best Regards,<br/><b>Stellar Admissions Team</b></p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Stellar Admissions" <admissions@stellarinstitute.edu>',
    to: user.email,
    subject: `Admission Documents – ${user.fullName}`,
    html: htmlContent,
    attachments: [
      {
        filename: `Stellar_Receipt_${user.fullName.replace(/\s/g, "_")}.pdf`,
        content: pdfBuffer,
      },
      {
        filename: "Stellar_Entrance_Examination_SEE_Curriculum.pdf",
        path: path.join(assetsPath, "Stellar Entrance Examination (SEE) – Curriculum.pdf"),
      },
      {
        filename: "Stellar_Interview_Curriculum.pdf",
        path: path.join(assetsPath, "Interview_Curriculum.pdf"),
      },
    ],
  });
};