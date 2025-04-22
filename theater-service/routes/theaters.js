const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaterController');

router.get('/', theaterController.getAllTheaters);
router.get('/:id/seats', theaterController.getSeatsByTheater);
router.post('/seats/:id/book', theaterController.bookSeat);
module.exports = router;
