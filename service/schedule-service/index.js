require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Ubah ke 3004 agar sesuai dengan service lain

app.use(express.json());

app.use(cors());

// Import routes
const scheduleRoutes = require('./routes/schedules');

// Use routes
app.use('/schedules', scheduleRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Schedule Service' });
});

app.listen(port, () => {
  console.log(`Schedule Service running at http://localhost:${port}`);
});