require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3006;

app.use(express.json());
app.use('/notifications', require('./routes/notifications'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Notification Service' });
});

app.listen(port, () => {
  console.log(`Notification Service running at http://localhost:${port}`);
});