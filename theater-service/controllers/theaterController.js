let theaters = [
  { 
    id: 1, 
    name: 'Studio 1', 
    location: 'First Floor',
    capacity: 100,
    seats: Array(100).fill().map((_, index) => ({
      id: index + 1,
      row: String.fromCharCode(65 + Math.floor(index / 10)),
      number: (index % 10) + 1,
      status: 'available'
    }))
  },
  { 
    id: 2, 
    name: 'Studio 2',
    location: 'Second Floor',
    capacity: 80,
    seats: Array(80).fill().map((_, index) => ({
      id: index + 1,
      row: String.fromCharCode(65 + Math.floor(index / 10)),
      number: (index % 10) + 1,
      status: 'available'
    }))
  }
];

// Get all theaters
exports.getAllTheaters = (req, res) => res.json(theaters);

// Get theater by ID
exports.getTheaterById = (req, res) => {
  const theater = theaters.find(t => t.id == req.params.id);
  theater ? res.json(theater) : res.status(404).json({ error: 'Theater not found' });
};

// Get seats by theater
exports.getSeatsByTheater = (req, res) => {
  const theater = theaters.find(t => t.id == req.params.theaterId);
  theater ? res.json(theater.seats) : res.status(404).json({ error: 'Theater not found' });
};

// Get available seats in a theater
exports.getAvailableSeats = (req, res) => {
  const theater = theaters.find(t => t.id == req.params.theaterId);
  
  if (!theater) {
    return res.status(404).json({ error: 'Theater not found' });
  }
  
  const availableSeats = theater.seats.filter(seat => seat.status === 'available');
  res.json(availableSeats);
};

// Get seats by schedule (simulated - would need integration with Schedule Service)
exports.getSeatsBySchedule = (req, res) => {
  const theaterId = parseInt(req.params.theaterId);
  const scheduleId = parseInt(req.params.scheduleId);
  
  const theater = theaters.find(t => t.id === theaterId);
  
  if (!theater) {
    return res.status(404).json({ error: 'Theater not found' });
  }
  
  // In a real implementation, we would check which seats are booked for this schedule
  // Here we'll simulate some seats being booked
  const simulatedBookedSeats = [];
  
  // Generate some random booked seats based on scheduleId
  for (let i = 0; i < 10; i++) {
    const randomSeatIndex = (scheduleId * 7 + i) % theater.seats.length;
    simulatedBookedSeats.push(randomSeatIndex);
  }
  
  // Create a copy of seats with updated status based on bookings
  const seatsWithStatus = theater.seats.map((seat, index) => ({
    ...seat,
    status: simulatedBookedSeats.includes(index) ? 'booked' : 'available'
  }));
  
  res.json(seatsWithStatus);
};

// Add a new theater
exports.addTheater = (req, res) => {
  const { name, location, capacity } = req.body;
  
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Name and capacity are required' });
  }
  
  const newTheater = {
    id: theaters.length + 1,
    name,
    location: location || '',
    capacity: parseInt(capacity),
    seats: [] // Empty by default, seats setup via separate endpoint
  };
  
  theaters.push(newTheater);
  res.status(201).json(newTheater);
};

// Update theater details
exports.updateTheater = (req, res) => {
  const theaterId = parseInt(req.params.id);
  const { name, location, capacity } = req.body;
  
  const theaterIndex = theaters.findIndex(t => t.id === theaterId);
  
  if (theaterIndex === -1) {
    return res.status(404).json({ error: 'Theater not found' });
  }
  
  theaters[theaterIndex] = {
    ...theaters[theaterIndex],
    ...(name && { name }),
    ...(location && { location }),
    ...(capacity && { capacity: parseInt(capacity) })
  };
  
  res.json(theaters[theaterIndex]);
};

// Setup theater seats
exports.setupTheaterSeats = (req, res) => {
  const theaterId = parseInt(req.params.theaterId);
  const { rows, seatsPerRow } = req.body;
  
  if (!rows || !seatsPerRow) {
    return res.status(400).json({ error: 'Rows and seatsPerRow are required' });
  }
  
  const theaterIndex = theaters.findIndex(t => t.id === theaterId);
  
  if (theaterIndex === -1) {
    return res.status(404).json({ error: 'Theater not found' });
  }
  
  const totalSeats = rows * seatsPerRow;
  theaters[theaterIndex].capacity = totalSeats;
  
  // Generate seats based on rows and seats per row
  theaters[theaterIndex].seats = Array(totalSeats).fill().map((_, index) => ({
    id: index + 1,
    row: String.fromCharCode(65 + Math.floor(index / seatsPerRow)),
    number: (index % seatsPerRow) + 1,
    status: 'available'
  }));
  
  res.json(theaters[theaterIndex]);
};

// Update seat status
exports.updateSeatStatus = (req, res) => {
  const theaterId = parseInt(req.params.theaterId);
  const seatId = parseInt(req.params.seatId);
  const { status } = req.body;
  
  if (!status || !['available', 'booked', 'unavailable'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (available, booked, unavailable) is required' });
  }
  
  const theaterIndex = theaters.findIndex(t => t.id === theaterId);
  
  if (theaterIndex === -1) {
    return res.status(404).json({ error: 'Theater not found' });
  }
  
  const seatIndex = theaters[theaterIndex].seats.findIndex(s => s.id === seatId);
  
  if (seatIndex === -1) {
    return res.status(404).json({ error: 'Seat not found' });
  }
  
  theaters[theaterIndex].seats[seatIndex].status = status;
  
  res.json(theaters[theaterIndex].seats[seatIndex]);
};

// Book a seat
exports.bookSeat = (req, res) => {
  const { id } = req.params;
  const seatIndex = req.body.seat;
  const theater = theaters.find(t => t.id == id);

  if (!theater || seatIndex >= theater.seats.length || theater.seats[seatIndex].status !== 'available') {
    return res.status(400).json({ error: 'Seat unavailable' });
  }

  theater.seats[seatIndex].status = 'booked';

  res.json({ message: 'Seat booked', seat: theater.seats[seatIndex] });
};