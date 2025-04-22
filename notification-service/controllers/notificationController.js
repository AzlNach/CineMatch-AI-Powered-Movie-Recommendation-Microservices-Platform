exports.sendNotification = (req, res) => {
  const { to, subject, message } = req.body;
  console.log(`Sending notification to ${to}: ${subject} - ${message}`);
  res.json({ status: 'sent' });
};
