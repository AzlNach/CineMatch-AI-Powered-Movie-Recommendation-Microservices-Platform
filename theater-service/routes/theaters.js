const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaterController');

// Basic theater endpoints
router.get('/', theaterController.getAllTheaters);
router.get('/:id', theaterController.getTheaterById);

// Seat-related endpoints
router.get('/:theaterId/seats', theaterController.getSeatsByTheater);
router.get('/:theaterId/seats/available', theaterController.getAvailableSeats);
router.get('/:theaterId/seats/:scheduleId', theaterController.getSeatsBySchedule);

// Admin endpoints
router.post('/', theaterController.addTheater);
router.put('/:id', theaterController.updateTheater);
router.post('/:theaterId/seats', theaterController.setupTheaterSeats);
router.put('/:theaterId/seats/:seatId', theaterController.updateSeatStatus);
router.post('/seats/:id/book', theaterController.bookSeat);

module.exports = router;