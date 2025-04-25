require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

// Import routes
const movieRoutes = require('./routes/movies');
const genreRoutes = require('./routes/genres');

// Use routes
app.use('/movies', movieRoutes);
app.use('/genres', genreRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Movie Service' });
});

app.listen(port, () => {
  console.log(`Movie Service running at http://localhost:${port}`);
});