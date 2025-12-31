import PDFDocument from "pdfkit";
import path from "path";

export const generateApplicationPDF = (data) => {
  return new Promise((resolve, reject) => {
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
      border: "#e2e8f0",
      bgLight: "#f8fafc"
    };

    // --- Header ---
    doc.rect(0, 0, 612, 110).fill(COLORS.primary);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(24).text("APPLICATION RECORD", 50, 40);
    doc.fontSize(9).fillColor("#94a3b8").text(`ID: ${data._id || 'N/A'} | Generated: ${new Date().toLocaleDateString()}`, 50, 70);

    let y = 140;

    const drawSectionHeader = (title) => {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.fillColor(COLORS.accent).font("Helvetica-Bold").fontSize(11).text(title.toUpperCase(), 50, y);
      y += 15;
      doc.moveTo(50, y).lineTo(545, y).strokeColor(COLORS.border).stroke();
      y += 15;
    };

    const drawField = (label, value) => {
      if (y > 750) { doc.addPage(); y = 50; }
      doc.fillColor(COLORS.textLight).font("Helvetica-Bold").fontSize(8).text(label.toUpperCase(), 50, y, { width: 140 });
      doc.fillColor(COLORS.textDark).font("Helvetica").fontSize(10).text(value || "Not Provided", 200, y, { width: 345 });
      y += 22;
    };

    // --- 1. Personal & Parental ---
    drawSectionHeader("Personal & Parental Background");
    drawField("Full Name", data.fullName);
    drawField("Father's Name", data.fatherName);
    drawField("Father's Occupation", `${data.fatherOccupation} (${data.fatherHighestEducation})`);
    drawField("Mother's Name", data.motherName);
    drawField("Annual Family Income", data.fatherIncome);

    // --- 2. Education ---
    y += 10;
    drawSectionHeader("Academic Qualifications");
    if (data.educations && data.educations.length > 0) {
      data.educations.forEach(edu => {
        drawField(edu.level, `Score: ${edu.percentage || edu.cgpa} | Document Verified`);
      });
    }

    // --- 3. Extra-Curriculars ---
    y += 10;
    drawSectionHeader("Extra-Curricular Activities");
    doc.fillColor(COLORS.textDark).font("Helvetica").fontSize(10).text(data.extracurriculars || "None listed", 50, y, { width: 495 });
    y += 30;

    // --- 4. Certifications ---
    if (data.certifications && data.certifications.length > 0) {
      drawSectionHeader("Certifications");
      data.certifications.forEach(cert => {
        drawField(cert.title, `${cert.organisation} (${cert.certificateType})`);
      });
    }

    // --- Status Badge ---
    y += 20;
    doc.roundedRect(50, y, 180, 30, 5).fill(COLORS.accent);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text("STATUS: SUBMITTED", 75, y + 10);

    // --- Page Numbers ---
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(COLORS.textLight).text(`Page ${i + 1} of ${pages.count} • Stellar Identity System`, 0, 800, { align: "center", width: 612 });
    }

    doc.end();
  });
};