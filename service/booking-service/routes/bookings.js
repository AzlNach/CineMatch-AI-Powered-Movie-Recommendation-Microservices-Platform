const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Booking endpoints
router.post('/', bookingController.createBooking);
router.get('/:id', bookingController.getBookingById);
router.get('/user/:userId', bookingController.getBookingsByUser);
router.put('/:id/cancel', bookingController.cancelBooking);
router.put('/:id/confirm', bookingController.confirmBooking);

// Validation endpoints
router.get('/check-seats', bookingController.checkSeatsAvailability);

// Admin endpoints
router.get('/', bookingController.getAllBookings);
router.get('/statistics/summary', bookingController.getBookingStatistics);

module.exports = router;