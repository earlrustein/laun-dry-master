const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { sendEmailWithAttachment } = require('../services/emailService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/send-email', upload.single('file'), async (req, res) => {
  try {
    const { subject, text } = req.body;

    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    await sendEmailWithAttachment({
      to: ['rstn.mesa@gmail.com', 'chastineflorentino@gmail.com'],
      from: {
        email: 'earl.rustein.mesa@gmail.com',
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

module.exports = router;
