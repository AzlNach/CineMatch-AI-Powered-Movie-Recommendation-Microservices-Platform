const express = require('express');
const app = express();
const port = 3002;

app.use(express.json());
app.use('/movies', require('./routes/movies'));

app.listen(port, () => {
  console.log('Movie Service running at http://localhost:' + port);
});
