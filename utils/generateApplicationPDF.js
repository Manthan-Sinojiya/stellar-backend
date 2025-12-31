// import PDFDocument from "pdfkit";
// import path from "path";
// import fs from "fs";

// export const generateApplicationPDF = (data) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
//     const buffers = [];
//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", () => resolve(Buffer.concat(buffers)));
//     doc.on("error", reject);

//     const COLORS = {
//       primary: "#0f172a",
//       accent: "#ab45ff",
//       textDark: "#1e293b",
//       textLight: "#64748b",
//       divider: "#e2e8f0",
//     };

//     // Path to your logo in the backend root
//     const logoPath = path.join(process.cwd(), "logo.png");

//     // Helper Function to draw Header on every page
//     const drawHeader = (isFirstPage = false) => {
//       // Dark Background Header
//       doc.rect(0, 0, 612, 115).fill(COLORS.primary);

//       // 1. ADD LOGO (Top Left)
//       if (fs.existsSync(logoPath)) {
//         doc.image(logoPath, 40, 25, { width: 50 });
//       }

//       // 2. OFFICIAL TITLE (Shifted right to make room for logo)
//       doc
//         .fillColor("#ffffff")
//         .font("Helvetica-Bold")
//         .fontSize(22)
//         .text("APPLICATION FORM", 100, 35, { characterSpacing: 1 });

//       doc
//         .fontSize(10)
//         .fillColor(COLORS.accent)
//         .text("STELLAR INSTITUTE OF TECHNOLOGY", 100, 65, {
//           characterSpacing: 2,
//         });

//       // 3. FIXED OVERLAPPING ID & DATE (Shifted down and aligned right)
//       doc.fillColor("#94a3b8").font("Helvetica").fontSize(8);

//       // Using a small offset to ensure no overlap
//       doc.text(`RECORD ID: ${data._id || "PENDING"}`, 350, 80, {
//         align: "right",
//         width: 220,
//       });
//       doc.text(`GENERATED: ${new Date().toLocaleString()}`, 350, 92, {
//         align: "right",
//         width: 220,
//       });
//     };

//     // Initialize first page header
//     drawHeader(true);

//     let y = 145; // Start content below header

//     const drawSection = (title) => {
//       if (y > 700) {
//         doc.addPage();
//         drawHeader();
//         y = 145;
//       }
//       doc
//         .fillColor(COLORS.accent)
//         .font("Helvetica-Bold")
//         .fontSize(11)
//         .text(title.toUpperCase(), 50, y);
//       y += 15;
//       doc
//         .moveTo(50, y)
//         .lineTo(562, y)
//         .strokeColor(COLORS.divider)
//         .lineWidth(0.5)
//         .stroke();
//       y += 15;
//     };

//     const drawRow = (label1, val1, label2, val2) => {
//       if (y > 750) {
//         doc.addPage();
//         drawHeader();
//         y = 145;
//       }
//       doc
//         .fillColor(COLORS.textLight)
//         .font("Helvetica-Bold")
//         .fontSize(8)
//         .text(label1.toUpperCase(), 50, y);
//       doc
//         .fillColor(COLORS.textDark)
//         .font("Helvetica")
//         .fontSize(10)
//         .text(val1 || "N/A", 50, y + 12, { width: 230 });

//       if (label2) {
//         doc
//           .fillColor(COLORS.textLight)
//           .font("Helvetica-Bold")
//           .fontSize(8)
//           .text(label2.toUpperCase(), 310, y);
//         doc
//           .fillColor(COLORS.textDark)
//           .font("Helvetica")
//           .fontSize(10)
//           .text(val2 || "N/A", 310, y + 12, { width: 230 });
//       }
//       y += 45;
//     };

//     // --- Content Rendering ---
//     drawSection("Applicant Identity");
//     drawRow("Full Name", data.fullName, "Email Address", data.email);
//     drawRow("Mobile Number", data.mobile || data.phone, "City", data.city);

//     drawSection("Parental Background");
//     drawRow(
//       "Father's Name",
//       data.fatherName,
//       "Father's Occupation",
//       data.fatherOccupation
//     );
//     drawRow(
//       "Father's Education",
//       data.fatherHighestEducation,
//       "Annual Income",
//       data.fatherIncome
//     );
//     drawRow(
//       "Mother's Name",
//       data.motherName,
//       "Mother's Occupation",
//       data.motherOccupation
//     );
//     drawRow("Mother's Education", data.motherEducation);

//     drawSection("Evaluation & Academic");
//     drawRow(
//       "Aptitude Status",
//       data.quizSummary || "COMPLETED",
//       "Interview Date",
//       data.interviewDate
//     );

//     if (data.educations && data.educations.length > 0) {
//       data.educations.forEach((edu) => {
//         drawRow(
//           `${edu.level} Education`,
//           `Score: ${edu.percentage || edu.cgpa}`,
//           "Status",
//           "Verified"
//         );
//       });
//     }

//     drawSection("Certifications & Activities");
//     doc
//       .fillColor(COLORS.textDark)
//       .font("Helvetica")
//       .fontSize(9)
//       .text(data.extracurriculars || "None", 50, y, { width: 500 });
//     y += 30;

//     // --- Finalize Pages (Footers) ---
//     const pages = doc.bufferedPageRange();
//     for (let i = 0; i < pages.count; i++) {
//       doc.switchToPage(i);

//       // Bottom Status Badge
//       doc.roundedRect(420, 785, 140, 25, 4).fill(COLORS.accent);
//       doc
//         .fillColor("#ffffff")
//         .font("Helvetica-Bold")
//         .fontSize(9)
//         .text("SUBMITTED", 420, 793, { align: "center", width: 140 });

//       doc
//         .fontSize(8)
//         .fillColor(COLORS.textLight)
//         .text(
//           `Page ${i + 1} of ${pages.count} | Stellar Secure Record`,
//           50,
//           795
//         );
//     }

//     doc.end();
//   });
// };

import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

/**
 * Generates an attractive, branded Application PDF with background headers and logos.
 */
export const generateApplicationPDF = (data) => {
  return new Promise((resolve, reject) => {
    // Standard A4 size is 595.28 x 841.89 points
    const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const COLORS = {
      primary: "#0f172a",
      accent: "#ab45ff",
      textDark: "#1e293b",
      textLight: "#64748b",
      divider: "#e2e8f0",
    };

    // Paths to assets in your backend root
    const logoPath = path.join(process.cwd(), "logo.png");
    const headerBgPath = path.join(process.cwd(), "header-bg.png"); // Ensure this file exists

    /**
     * Helper Function to draw the Branded Header on every page
     */
    const drawHeader = () => {
      const headerHeight = 115;
      const pageWidth = 612; // A4 Width in points

      // 1. ADD BACKGROUND IMAGE OR FALLBACK RECTANGLE
      if (fs.existsSync(headerBgPath)) {
        // Fits the background image into the header area
        doc.image(headerBgPath, 0, 0, { width: pageWidth, height: headerHeight });
      } else {
        // Fallback to solid color if background image is missing
        doc.rect(0, 0, pageWidth, headerHeight).fill(COLORS.primary);
      }

      // 2. ADD LOGO (Top Left)
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 25, { width: 50 });
      }

      // 3. OFFICIAL TITLE (Positioned to avoid overlap)
      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("APPLICATION FORM", 100, 35, { characterSpacing: 1 });

      doc
        .fontSize(10)
        .fillColor(COLORS.accent)
        .text("STELLAR INSTITUTE OF TECHNOLOGY", 100, 65, {
          characterSpacing: 2,
        });

      // 4. METADATA (Record ID & Date) - Aligned Right
      doc.fillColor("#ffffff").font("Helvetica").fontSize(8);
      
      doc.text(`RECORD ID: ${data._id || "PENDING"}`, 350, 75, {
        align: "right",
        width: 220,
      });
      doc.text(`GENERATED: ${new Date().toLocaleString()}`, 350, 87, {
        align: "right",
        width: 220,
      });
    };

    // Initialize the first page
    drawHeader();

    let y = 145; // Starting Y position for content

    /**
     * Draws a Section Header with a divider line
     */
    const drawSection = (title) => {
      if (y > 700) {
        doc.addPage();
        drawHeader();
        y = 145;
      }
      doc
        .fillColor(COLORS.accent)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(title.toUpperCase(), 50, y);
      y += 15;
      doc
        .moveTo(50, y)
        .lineTo(562, y)
        .strokeColor(COLORS.divider)
        .lineWidth(0.5)
        .stroke();
      y += 15;
    };

    /**
     * Draws a row of data with optional two-column support
     */
    const drawRow = (label1, val1, label2, val2) => {
      if (y > 750) {
        doc.addPage();
        drawHeader();
        y = 145;
      }
      
      // Column 1
      doc
        .fillColor(COLORS.textLight)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(label1.toUpperCase(), 50, y);
      doc
        .fillColor(COLORS.textDark)
        .font("Helvetica")
        .fontSize(10)
        .text(val1 || "N/A", 50, y + 12, { width: 230 });

      // Column 2 (Optional)
      if (label2) {
        doc
          .fillColor(COLORS.textLight)
          .font("Helvetica-Bold")
          .fontSize(8)
          .text(label2.toUpperCase(), 310, y);
        doc
          .fillColor(COLORS.textDark)
          .font("Helvetica")
          .fontSize(10)
          .text(val2 || "N/A", 310, y + 12, { width: 230 });
      }
      y += 45;
    };

    // --- Content Rendering ---
    drawSection("Applicant Identity");
    drawRow("Full Name", data.fullName, "Email Address", data.email);
    drawRow("Mobile Number", data.mobile || data.phone, "City", data.city);

    drawSection("Parental Background");
    drawRow("Father's Name", data.fatherName, "Father's Occupation", data.fatherOccupation);
    drawRow("Father's Education", data.fatherHighestEducation, "Annual Income", data.fatherIncome);
    drawRow("Mother's Name", data.motherName, "Mother's Occupation", data.motherOccupation);
    drawRow("Mother's Education", data.motherEducation);

    drawSection("Evaluation & Academic");
    drawRow("Aptitude Status", data.quizSummary || "COMPLETED", "Interview Date", data.interviewDate);

    if (data.educations && data.educations.length > 0) {
      data.educations.forEach((edu) => {
        drawRow(
          `${edu.level} Education`,
          `Score: ${edu.percentage || edu.cgpa}`,
          "Status",
          "Verified"
        );
      });
    }

    drawSection("Certifications & Activities");
    doc
      .fillColor(COLORS.textDark)
      .font("Helvetica")
      .fontSize(9)
      .text(data.extracurriculars || "None provided", 50, y, { width: 500 });
    y += 30;

    // --- Finalize Pages (Headers & Footers) ---
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      // Bottom Status Badge (Fixed Position)
      doc.roundedRect(420, 785, 140, 25, 4).fill(COLORS.accent);
      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("SUBMITTED", 420, 793, { align: "center", width: 140 });

      // Page Numbering
      doc
        .fontSize(8)
        .fillColor(COLORS.textLight)
        .text(
          `Page ${i + 1} of ${pages.count} | Stellar Secure Digital Record`,
          50,
          795
        );
    }

    doc.end();
  });
};