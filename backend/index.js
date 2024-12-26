const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const emailRoutes = require('./routes/emailRoutes');
require('./utils/cronJobs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', emailRoutes);

app.get('/status', (req, res) => {
  res.status(200).json({ message: 'Hello!' });
  generateAndSendReport();
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
