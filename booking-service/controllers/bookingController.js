let bookings = [];

exports.createBooking = (req, res) => {
  const { userId, movieId, theaterId, seat, paymentInfo } = req.body;

  const newBooking = {
    id: bookings.length + 1,
    userId,
    movieId,
    theaterId,
    seat,
    status: 'pending'
  };
  bookings.push(newBooking);
  res.status(201).json(newBooking);
};

exports.getBookingById = (req, res) => {
  const booking = bookings.find(b => b.id == req.params.id);
  booking ? res.json(booking) : res.status(404).json({ error: 'Not found' });
};
