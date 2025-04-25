require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use('/bookings', require('./routes/bookings'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Booking Service' });
});

app.listen(port, () => {
  console.log(`Booking Service running at http://localhost:${port}`);
});