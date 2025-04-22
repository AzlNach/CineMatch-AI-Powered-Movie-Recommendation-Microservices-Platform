const express = require('express');
const app = express();
const port = 3003;

app.use(express.json());
app.use('/theaters', require('./routes/theaters'));

app.listen(port, () => {
  console.log(`Theater Service running at http://localhost:${port}`);
});
