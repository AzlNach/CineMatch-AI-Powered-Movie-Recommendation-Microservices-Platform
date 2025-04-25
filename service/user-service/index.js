require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());app.use(cors());
app.use('/users', require('./routes/users'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'User Service' });
});

app.listen(port, () => {
  console.log(`User Service running at http://localhost:${port}`);
});