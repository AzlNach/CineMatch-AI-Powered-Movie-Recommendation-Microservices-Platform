const express = require('express');
const app = express();
const port = 3005;

app.use(express.json());
app.use('/payments', require('./routes/payments'));

app.listen(port, () => {
  console.log('Payment Service running at http://localhost:' + port);
});
