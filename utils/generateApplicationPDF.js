import PDFDocument from "pdfkit";

export const generateApplicationPDF = async (student) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  doc.fontSize(18).text("Application Summary", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Full Name: ${student.fullName}`);
  doc.text(`Father Name: ${student.fatherName}`);
  doc.text(`Email: ${student.email}`);
  doc.text(`Mobile: ${student.mobile}`);
  doc.text(`Address: ${student.address1}, ${student.address2}`);
  doc.text(`City: ${student.city}`);
  doc.text(`State: ${student.state}`);
  doc.text(`Pincode: ${student.pincode}`);
  doc.moveDown();

  doc.text(`Education: ${student.education}`);
  doc.text(`Quiz Attempted: ${student.quizSummary}`);
  doc.text(`Final Interview Date: ${student.interviewDate}`);
  doc.moveDown();

  doc.text(
    "Our team will connect with you soon. You will be notified via email or SMS.",
    { align: "center" }
  );

  doc.end();

  return Buffer.concat(buffers);
};
