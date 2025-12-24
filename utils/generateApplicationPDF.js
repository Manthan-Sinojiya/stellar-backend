import PDFDocument from 'pdfkit';
import path from 'path';

/**
 * Generates a branded Application Summary PDF
 * @param {Object} data - Contains user info, interview date, and quiz status
 * @returns {Promise<Buffer>}
 */
export const generateApplicationPDF = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // --- PDF UI DESIGN ---

    // 1. BRANDED HEADER
    doc.rect(0, 0, 612, 120).fill('#0f172a'); // Dark Slate Background
    
    const logoPath = path.join(process.cwd(), 'public', 'favicon_io', 'logo.png');
    try {
      doc.image(logoPath, 50, 30, { width: 60 });
    } catch (e) {
      doc.fillColor('#ab45ff').fontSize(24).text('STELLAR', 50, 45);
    }

    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('APPLICATION SUMMARY', 130, 45, { characterSpacing: 2 });

    doc.fillColor('#94a3b8')
       .fontSize(8)
       .text(`GENERATED ON: ${new Date().toLocaleDateString()}`, 130, 70);

    // 2. TABLE GENERATOR FUNCTION
    const drawTableRow = (y, label, value, isHeader = false) => {
      if (isHeader) {
        doc.rect(50, y, 500, 25).fill('#ab45ff');
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text(label, 65, y + 8);
      } else {
        doc.rect(50, y, 500, 30).fill('#f8fafc');
        doc.rect(50, y, 500, 30).stroke('#e2e8f0');
        doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(9).text(label.toUpperCase(), 65, y + 10);
        doc.fillColor('#1e293b').font('Helvetica').fontSize(10).text(String(value || 'N/A'), 220, y + 10);
      }
    };

    // 3. RENDER DATA TABLE
    let currentY = 160;
    drawTableRow(currentY, 'PERSONAL & ADMISSION CREDENTIALS', null, true);
    
    const tableData = [
      { label: 'Full Name', value: data.fullName || data.name },
      { label: 'Father Name', value: data.fatherName },
      { label: 'Email Address', value: data.email },
      { label: 'Mobile Number', value: data.mobile || data.phone },
      { label: 'Residential City', value: data.city },
      { label: 'Aptitude Status', value: data.quizSummary || 'Completed' },
      { label: 'Scheduled Interview', value: data.interviewDate },
    ];

    tableData.forEach((item) => {
      currentY += 30;
      drawTableRow(currentY, item.label, item.value);
    });

    // 4. FOOTER
    doc.fontSize(8).fillColor('#94a3b8').text(
      'This is a system-generated encrypted document. © 2025 Stellar Institute of Technology',
      50, 780, { align: 'center' }
    );

    doc.end();
  });
};