import PDFDocument from "pdfkit";
import path from "path";

/**
 * Generates a branded Application Summary PDF
 * @param {Object} data
 * @returns {Promise<Buffer>}
 */
export const generateApplicationPDF = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    /* =====================================================
       COLORS & FONTS
    ===================================================== */
    const COLORS = {
      primary: "#0f172a", // slate
      accent: "#ab45ff",  // purple
      textDark: "#1e293b",
      textLight: "#64748b",
      border: "#e5e7eb",
      rowAlt: "#f8fafc",
    };

    /* =====================================================
       HEADER
    ===================================================== */
    doc.rect(0, 0, 612, 120).fill(COLORS.primary);

    const logoPath = path.join(process.cwd(), "public", "favicon_io", "logo.png");
    try {
      doc.image(logoPath, 50, 30, { width: 60 });
    } catch {
      doc.fillColor(COLORS.accent)
         .fontSize(26)
         .font("Helvetica-Bold")
         .text("STELLAR", 50, 45);
    }

    doc.fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("APPLICATION SUMMARY", 130, 40, {
        characterSpacing: 1.5,
      });

    doc.fontSize(9)
      .fillColor("#cbd5f5")
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 130, 72);

    /* =====================================================
       CONTENT START
    ===================================================== */
    let y = 150;

    /* SECTION TITLE */
    doc.fillColor(COLORS.textDark)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Applicant Information", 50, y);

    y += 10;
    doc.moveTo(50, y).lineTo(562, y).stroke(COLORS.border);
    y += 15;

    /* =====================================================
       TABLE FUNCTION
    ===================================================== */
    const drawRow = (label, value, isAlt = false) => {
      const rowHeight = 32;

      if (isAlt) {
        doc.rect(50, y, 512, rowHeight).fill(COLORS.rowAlt);
      }

      doc.fillColor(COLORS.textLight)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(label.toUpperCase(), 60, y + 10, { width: 160 });

      doc.fillColor(COLORS.textDark)
        .font("Helvetica")
        .fontSize(11)
        .text(value || "N/A", 240, y + 9, { width: 300 });

      doc.rect(50, y, 512, rowHeight).stroke(COLORS.border);
      y += rowHeight;
    };

    /* =====================================================
       TABLE DATA
    ===================================================== */
    const rows = [
      ["Full Name", data.fullName || data.name],
      ["Father Name", data.fatherName],
      ["Email Address", data.email],
      ["Mobile Number", data.mobile || data.phone],
      ["City", data.city],
      ["Aptitude Test Status", data.quizSummary || "Completed"],
      ["Interview Schedule", data.interviewDate],
    ];

    rows.forEach((row, index) =>
      drawRow(row[0], row[1], index % 2 === 0)
    );

    /* =====================================================
       STATUS BADGE
    ===================================================== */
    y += 30;
    doc.roundedRect(50, y, 200, 36, 8).fill(COLORS.accent);

    doc.fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("APPLICATION STATUS: SUBMITTED", 60, y + 11);

    /* =====================================================
       FOOTER
    ===================================================== */
    doc.fontSize(8)
      .fillColor("#94a3b8")
      .text(
        "This is a system-generated, encrypted document.\n© 2025 Stellar Institute of Technology",
        50,
        780,
        { align: "center", width: 512 }
      );

    doc.end();
  });
};
