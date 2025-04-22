const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

app.listen(port, () => {
  console.log(`User Service running on http://localhost:${port}`);
});
