let theaters = [
  { id: 1, name: 'Studio 1', seats: Array(10).fill(false) }
];

exports.getAllTheaters = (req, res) => res.json(theaters);
exports.getSeatsByTheater = (req, res) => {
  const theater = theaters.find(t => t.id == req.params.id);
  theater ? res.json(theater.seats) : res.status(404).json({ error: 'Not found' });
};
exports.bookSeat = (req, res) => {
  const { id } = req.params;
  const seatIndex = req.body.seat;
  const theater = theaters.find(t => t.id == id);

  if (!theater || theater.seats[seatIndex]) {
    return res.status(400).json({ error: 'Seat unavailable' });
  }

  theater.seats[seatIndex] = true;

  res.json({ message: 'Seat booked', theater });
};
