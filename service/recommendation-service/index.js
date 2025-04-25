require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3007;

app.use(cors());

app.use(express.json());

app.use('/recommendations', require('./routes/recommendations'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Recommendation Service' });
});

app.listen(port, () => {
  console.log(`Recommendation Service running at http://localhost:${port}`);
});