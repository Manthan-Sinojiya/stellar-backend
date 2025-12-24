import PDFDocument from "pdfkit";

/**
 * Generates Application PDF
 * @param {Object} student - merged student + application data
 * @returns {Promise<Buffer>}
 */
export const generateApplicationPDF = (student) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on("error", reject);

      /* ---------- HEADER ---------- */
      doc
        .fontSize(18)
        .text("Stellar Campus – Application Summary", { align: "center" });

      doc.moveDown(2);

      /* ---------- PERSONAL DETAILS ---------- */
      doc.fontSize(12).text(`Full Name: ${student.fullName || "-"}`);
      doc.text(`Father Name: ${student.fatherName || "-"}`);
      doc.text(`Email: ${student.email || "-"}`);
      doc.text(`Mobile: ${student.mobile || "-"}`);
      doc.text(
        `Address: ${student.address1 || ""} ${student.address2 || ""}`
      );
      doc.text(`City: ${student.city || "-"}`);
      doc.text(`State: ${student.state || "-"}`);
      doc.text(`Pincode: ${student.pincode || "-"}`);

      doc.moveDown();

      /* ---------- APPLICATION DETAILS ---------- */
      doc.text(`Quiz Status: ${student.quizSummary || "Completed"}`);
      doc.text(`Interview Date: ${student.interviewDate || "-"}`);

      doc.moveDown(2);

      doc
        .fontSize(11)
        .text(
          "Our admissions team will contact you soon. Please check your email or SMS for further updates.",
          { align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
