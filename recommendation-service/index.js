const express = require('express');
const app = express();
const port = 3007;


app.use(express.json());

app.use('/recommendations',require('./routes/recommendations'));

app.listen(port, () => {
  console.log(`Recommendation Service running at http://localhost:${port}`);
});