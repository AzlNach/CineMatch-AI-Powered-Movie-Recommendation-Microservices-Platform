const express = require('express');
const app = express();
const port = 3001;


app.use(express.json());
app.use('/users', require('./routes/users'));

app.listen(port, () => {
  console.log(`User Service running at http://localhost:${port}`);
});