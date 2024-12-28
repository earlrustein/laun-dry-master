const sendGridMail = require('@sendgrid/mail');
require('dotenv').config();

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailWithAttachment = async ({ to, from, subject, text, fileBuffer, filename }) => {
  try {
    const message = {
      to,
      from,
      subject,
      text,
      attachments: [
        {
          content: fileBuffer.toString('base64'),
          filename,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };

    await sendGridMail.send(message);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error.message);
    throw error;
  }
};

module.exports = { sendEmailWithAttachment };
