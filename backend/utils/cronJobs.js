const cron = require('node-cron');
const { fetchDataForReport } = require('../services/reportService');
const { generatePDF } = require('../services/pdfService');
const { sendEmailWithAttachment } = require('../services/emailService');
const moment = require('moment');

const generateAndSendReport = async () => {
  try {
    const reportData = await fetchDataForReport();
    const pdfBuffer = await generatePDF(reportData);

    const buffer = Buffer.from(pdfBuffer);

    await sendEmailWithAttachment({
      to: ['rstn.mesa@gmail.com'],
      from: {
        email: 'earl.rustein.mesa@gmail.com',
        name: 'Laundry Master'
      },
      subject: 'Daily Report',
      text: 'Please find the attached daily report',
      fileBuffer: buffer, 
      filename: `Daily Report - ${moment().utcOffset(8).format('MMM. DD, YYYY')}.pdf`,
    });
  } catch (error) {
    console.error('Error generating and sending report:', error);
  }
};


cron.schedule('00 22 * * *', () => {
  console.log('Running scheduled report generation and email at 10 PM UTC+8...');
  generateAndSendReport();
}, { timezone: 'Asia/Singapore' });
