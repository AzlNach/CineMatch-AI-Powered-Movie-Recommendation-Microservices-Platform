const express = require('express');
const app = express();
const port = 3004;

app.use(express.json());
app.use('/bookings', require('./routes/bookings'));

app.listen(port, () => {
  console.log('Booking Service running at http://localhost:' + port);
});
