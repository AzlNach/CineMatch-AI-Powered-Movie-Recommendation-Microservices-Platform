require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

// Import routes
const theaterRoutes = require('./routes/theaters');
const screenRoutes = require('./routes/screens');
const seatRoutes = require('./routes/seats');

// Use routes
app.use('/theaters', theaterRoutes);
app.use('/screens', screenRoutes);
app.use('/seats', seatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Theater Service' });
});

app.listen(port, () => {
  console.log(`Theater Service running at http://localhost:${port}`);
});