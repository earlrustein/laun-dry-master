const express = require('express');
const cors = require('cors');
const sendGridMail = require('@sendgrid/mail');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
const upload = multer({ dest: 'uploads/' }); 

app.post('/send-email', upload.single('file'), async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }
    console.log(req.body);
    const message = {
      to,
      from: 'earl.rustein.mesa@gmail.com',
      subject,
      text,
      attachments: [
        {
          content: fs.readFileSync(req.file.path).toString('base64'),
          filename: req.file.originalname,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };

    await sendGridMail.send(message);
    fs.unlinkSync(req.file.path);

    res.status(200).send({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error.message);
    res.status(500).send({ error: 'Failed to send email' });
  }
});

app.get('/status', (req, res) => {
  res.status(200).json({messagge: "Server Running..."});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
