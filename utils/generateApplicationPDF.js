import PDFDocument from "pdfkit";

export const generateApplicationPDF = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const COLORS = {
      primary: "#0f172a", // Deep Navy
      accent: "#ab45ff",  // Stellar Purple
      textDark: "#1e293b",
      textLight: "#64748b",
      divider: "#e2e8f0",
      bgSection: "#f8fafc"
    };

    // ================= HEADER =================
    doc.rect(0, 0, 612, 120).fill(COLORS.primary);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(26).text("OFFICIAL APPLICATION", 50, 40, { characterSpacing: 1 });
    doc.fontSize(10).fillColor(COLORS.accent).text("STELLAR INSTITUTE OF TECHNOLOGY", 50, 70, { characterSpacing: 2 });
    
    // Top Right Info
    doc.fillColor("#94a3b8").fontSize(8)
       .text(`RECORD ID: ${data._id || "PENDING"}`, 400, 45, { align: "right" })
       .text(`GENERATED: ${new Date().toLocaleString()}`, 400, 58, { align: "right" });

    let y = 150;

    // Helper: Draw Section Header
    const drawSection = (title) => {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.fillColor(COLORS.accent).font("Helvetica-Bold").fontSize(12).text(title.toUpperCase(), 50, y);
      y += 15;
      doc.moveTo(50, y).lineTo(545, y).strokeColor(COLORS.divider).lineWidth(1).stroke();
      y += 15;
    };

    // Helper: Two-Column Data Row
    const drawRow = (label1, val1, label2, val2) => {
      if (y > 750) { doc.addPage(); y = 50; }
      // Column 1
      doc.fillColor(COLORS.textLight).font("Helvetica-Bold").fontSize(8).text(label1.toUpperCase(), 50, y);
      doc.fillColor(COLORS.textDark).font("Helvetica").fontSize(10).text(val1 || "N/A", 50, y + 12, { width: 230 });
      // Column 2
      if (label2) {
        doc.fillColor(COLORS.textLight).font("Helvetica-Bold").fontSize(8).text(label2.toUpperCase(), 300, y);
        doc.fillColor(COLORS.textDark).font("Helvetica").fontSize(10).text(val2 || "N/A", 300, y + 12, { width: 230 });
      }
      y += 40;
    };

    // ================= 1. PERSONAL DETAILS =================
    drawSection("Applicant Identity");
    drawRow("Full Name", data.fullName, "Email Address", data.email);
    drawRow("Mobile Number", data.mobile || data.phone || "N/A", "City", data.city);

    // ================= 2. PARENTAL BACKGROUND =================
    drawSection("Parental & Financial Background");
    drawRow("Father's Name", data.fatherName, "Father's Occupation", data.fatherOccupation);
    drawRow("Father's Education", data.fatherHighestEducation, "Annual Family Income", data.fatherIncome);
    drawRow("Mother's Name", data.motherName, "Mother's Occupation", data.motherOccupation);
    drawRow("Mother's Education", data.motherEducation);

    // ================= 3. ACADEMIC & PROGRESS =================
    drawSection("Academic Performance");
    if (data.educations && data.educations.length > 0) {
      data.educations.forEach(edu => {
        drawRow(`${edu.level} Status`, "Verified Record", `${edu.level} Score`, `${edu.percentage || edu.cgpa}`);
      });
    }

    // ================= 4. APTITUDE & INTERVIEW =================
    drawSection("Evaluation Summary");
    drawRow("Aptitude Test", data.quizSummary || "COMPLETED", "Interview Schedule", data.interviewDate);

    // ================= 5. ACTIVITIES & CERTS =================
    drawSection("Extra-Curriculars & Certifications");
    doc.fillColor(COLORS.textDark).font("Helvetica").fontSize(10).text(data.extracurriculars || "No extra-curricular activities listed.", 50, y, { width: 500 });
    y += 40;

    if (data.certifications && data.certifications.length > 0) {
      data.certifications.forEach(cert => {
        doc.rect(50, y - 5, 500, 25).fill(COLORS.bgSection);
        doc.fillColor(COLORS.textDark).font("Helvetica-Bold").fontSize(9).text(`• ${cert.title}`, 60, y);
        doc.fillColor(COLORS.textLight).font("Helvetica").text(cert.organisation, 300, y);
        y += 30;
      });
    }

    // ================= FOOTER & STATUS =================
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Status Badge on every page
      doc.roundedRect(400, 780, 160, 30, 5).fill(COLORS.accent);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text("STATUS: SUBMITTED", 425, 792);

      doc.fontSize(8).fillColor(COLORS.textLight).text(
        `Page ${i + 1} of ${pages.count} | Secure Digital Record | © 2025 Stellar`,
        50, 800
      );
    }

    doc.end();
  });
};