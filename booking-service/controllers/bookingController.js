const axios = require('axios');

let bookings = [];

// Service URLs
const THEATER_SERVICE = 'http://localhost:3003';
const PAYMENT_SERVICE = 'http://localhost:3005';

// Create new booking
exports.createBooking = (req, res) => {
  const { userId, movieId, scheduleId, theaterId, seats, paymentInfo } = req.body;

  if (!userId || !movieId || !scheduleId || !theaterId || !seats || seats.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check seat availability (in a real app, call the theater service)
  // For now, assume all seats are available

  const newBooking = {
    id: bookings.length + 1,
    userId,
    movieId,
    scheduleId,
    theaterId,
    seats,
    totalAmount: seats.length * 50000, // Example price calculation
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  bookings.push(newBooking);
  res.status(201).json(newBooking);
};

// Get booking by ID
exports.getBookingById = (req, res) => {
  const booking = bookings.find(b => b.id == req.params.id);
  booking ? res.json(booking) : res.status(404).json({ error: 'Booking not found' });
};

// Get bookings by user ID
exports.getBookingsByUser = (req, res) => {
  const userBookings = bookings.filter(b => b.userId == req.params.userId);
  res.json(userBookings);
};

// Cancel booking
exports.cancelBooking = (req, res) => {
  const bookingId = parseInt(req.params.id);
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  if (bookings[bookingIndex].status === 'confirmed') {
    return res.status(400).json({ error: 'Cannot cancel a confirmed booking' });
  }
  
  bookings[bookingIndex].status = 'cancelled';
  bookings[bookingIndex].updatedAt = new Date().toISOString();
  
  res.json(bookings[bookingIndex]);
};

// Confirm booking (internal use)
exports.confirmBooking = (req, res) => {
  const bookingId = parseInt(req.params.id);
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  if (bookings[bookingIndex].status === 'cancelled') {
    return res.status(400).json({ error: 'Cannot confirm a cancelled booking' });
  }
  
  bookings[bookingIndex].status = 'confirmed';
  bookings[bookingIndex].updatedAt = new Date().toISOString();
  
  res.json(bookings[bookingIndex]);
};

// Check seat availability
exports.checkSeatsAvailability = async (req, res) => {
  const { theaterId, scheduleId, seats } = req.query;
  
  if (!theaterId || !scheduleId || !seats) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // In a real app, call the theater service to check seat availability
    // For now, simulate the response
    const available = Math.random() > 0.2; // 80% chance of seats being available
    
    res.json({
      theaterId,
      scheduleId,
      seats: seats.split(','),
      available
    });
  } catch (error) {
    console.error('Error checking seat availability:', error);
    res.status(500).json({ error: 'Failed to check seat availability' });
  }
};