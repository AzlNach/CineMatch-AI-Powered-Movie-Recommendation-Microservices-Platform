const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Seat routes
router.get('/screen/:screenId', seatController.getSeatsByScreenId);
router.get('/:id', seatController.getSeatById);
router.post('/', seatController.createSeat);
router.put('/:id', seatController.updateSeat);
router.delete('/:id', seatController.deleteSeat);
router.post('/batch', seatController.createMultipleSeats);

module.exports = router;