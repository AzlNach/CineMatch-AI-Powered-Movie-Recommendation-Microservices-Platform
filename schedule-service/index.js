const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use('/schedules', require('./routes/schedules'));

app.listen(port, () => {
  console.log(`Schedule Service running at http://localhost:${port}`);
});