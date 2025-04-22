exports.processPayment = (req, res) => {
  const { bookingId, amount } = req.body;

  res.json({ status: 'success', bookingId, amount });
};
