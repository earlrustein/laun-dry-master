const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { sendEmailWithAttachment } = require('../services/emailService');
const { fetchDataForReport } = require('../services/reportService');
const { generatePDF } = require('../services/pdfService');

const moment = require('moment');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
require('dotenv').config();

router.post('/send-email-mobile', upload.single('file'), async (req, res) => {
  try {
    const { subject, text } = req.body;

    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    await sendEmailWithAttachment({
      to: process.env.EMAIL_TO,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Laundry Master'
      },
      subject,
      text,
      fileBuffer,
      filename: req.file.originalname,
    });

    fs.unlinkSync(req.file.path);
    res.status(200).send({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to send email' });
  }
});

router.post('/send-email-web', upload.single('file'), async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const reportData = await fetchDataForReport(startDate, endDate);
    const pdfBuffer = await generatePDF(reportData);
    const buffer = Buffer.from(pdfBuffer);

    await sendEmailWithAttachment({
      to: process.env.EMAIL_TO,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Laundry Master'
      },
      subject: 'Financial Report',
      text: `Please find the attached Financial Report from ${moment(startDate).utcOffset(8).format('MMM. DD, YYYY')} 
        to ${moment(endDate).utcOffset(8).format('MMM. DD, YYYY')}`,
      fileBuffer: buffer, 
      filename: `Financial Report (${moment(startDate).utcOffset(8).format('MMM. DD, YYYY')} - ${moment(endDate).utcOffset(8).format('MMM. DD, YYYY')}).pdf`,
    });
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error occurred:', error); 
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
