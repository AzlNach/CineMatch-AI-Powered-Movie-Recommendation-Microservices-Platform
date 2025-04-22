const express = require('express');
const app = express();
const port = 3006;

app.use(express.json());
app.use('/notifications', require('./routes/notifications'));

app.listen(port, () => {
  console.log('Notification Service running at http://localhost:' + port);
});
