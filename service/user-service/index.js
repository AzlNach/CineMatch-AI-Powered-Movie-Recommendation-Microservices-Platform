require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use('/users', require('./routes/users'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'User Service' });
});

app.listen(port, () => {
  console.log(`User Service running at http://localhost:${port}`);
});