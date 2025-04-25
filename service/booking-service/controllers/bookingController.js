const BookingModel = require('../models/BookingModel');
const axios = require('axios');
require('dotenv').config();

// Service URLs
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const SCHEDULE_SERVICE = process.env.SCHEDULE_SERVICE_URL || 'http://localhost:3000';
const THEATER_SERVICE = process.env.THEATER_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { userId, scheduleId, seatId, totalAmount } = req.body;

    if (!userId || !scheduleId || !seatId || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify user exists
    try {
      const userResponse = await axios.get(`${USER_SERVICE}/users/${userId}`);
      if (!userResponse.data) {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      return res.status(500).json({ error: 'Failed to verify user' });
    }

    // Verify schedule exists
    try {
      const scheduleResponse = await axios.get(`${SCHEDULE_SERVICE}/schedules/${scheduleId}`);
      if (!scheduleResponse.data) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
    } catch (error) {
      console.error('Error verifying schedule:', error);
      return res.status(500).json({ error: 'Failed to verify schedule' });
    }

    // Verify seat exists and is not already booked
    try {
      // First check if seat is already booked
      const isSeatBooked = await BookingModel.isSeatBooked(scheduleId, seatId);
      if (isSeatBooked) {
        return res.status(400).json({ error: 'Seat is already booked' });
      }

      // Then verify the seat exists
      const seatResponse = await axios.get(`${THEATER_SERVICE}/seats/${seatId}`);
      if (!seatResponse.data) {
        return res.status(404).json({ error: 'Seat not found' });
      }
    } catch (error) {
      console.error('Error verifying seat:', error);
      return res.status(500).json({ error: 'Failed to verify seat' });
    }

    // All validations passed, create booking
    const bookingId = await BookingModel.createBooking({
      user_id: userId,
      schedule_id: scheduleId,
      seat_id: seatId,
      total_amount: totalAmount
    });

    const newBooking = await BookingModel.getBookingById(bookingId);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await BookingModel.getBookingById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error in getBookingById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get bookings by user
exports.getBookingsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify user exists
    try {
      const userResponse = await axios.get(`${USER_SERVICE}/users/${userId}`);
      if (!userResponse.data) {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      // Continue anyway if user service is down
    }
    
    const bookings = await BookingModel.getBookingsByUserId(userId);
    res.json(bookings);
  } catch (error) {
    console.error('Error in getBookingsByUser:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    // Your existing code to cancel booking
    const booking = await BookingModel.getBookingById(bookingId);
    
    // Send notification after booking cancellation
    try {
      await axios.post(`${notificationServiceUrl}/notifications`, {
        userId: booking.user_id,
        bookingId: booking.id,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking #${booking.booking_code} has been cancelled.`
      });
      console.log(`Notification sent for booking #${bookingId} cancellation`);
    } catch (error) {
      console.error('Failed to send notification:', error.message);
      // Continue execution even if notification fails
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

// Confirm booking
exports.confirmBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    // Your existing code to update booking status
    const booking = await BookingModel.getBookingById(bookingId);
    
    // Send notification after status change
    try {
      await axios.post(`${notificationServiceUrl}/notifications`, {
        userId: booking.user_id,
        bookingId: booking.id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: `Your booking #${booking.booking_code} has been confirmed!`
      });
      console.log(`Notification sent for booking #${bookingId} confirmation`);
    } catch (error) {
      console.error('Failed to send notification:', error.message);
      // Continue execution even if notification fails
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error in confirmBooking:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
};

// Check seats availability
exports.checkSeatsAvailability = async (req, res) => {
  try {
    const { scheduleId, seatIds } = req.query;
    
    if (!scheduleId || !seatIds) {
      return res.status(400).json({ error: 'Schedule ID and seat IDs are required' });
    }
    
    const seatIdArray = seatIds.split(',').map(id => parseInt(id));
    const availabilityResults = [];
    
    for (const seatId of seatIdArray) {
      const isBooked = await BookingModel.isSeatBooked(scheduleId, seatId);
      availabilityResults.push({
        seatId,
        available: !isBooked
      });
    }
    
    res.json({
      scheduleId,
      seats: availabilityResults
    });
  } catch (error) {
    console.error('Error in checkSeatsAvailability:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const bookings = await BookingModel.getAllBookings(limit, offset);
    res.json(bookings);
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get booking statistics (admin only)
exports.getBookingStatistics = async (req, res) => {
  try {
    const statistics = await BookingModel.getBookingStatistics();
    res.json(statistics);
  } catch (error) {
    console.error('Error in getBookingStatistics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};