const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaterController');
const screenController = require('../controllers/screenController');

// Theater routes
router.get('/', theaterController.getAllTheaters);
router.get('/:id', theaterController.getTheaterById);
router.post('/', theaterController.createTheater);
router.put('/:id', theaterController.updateTheater);
router.delete('/:id', theaterController.deleteTheater);
router.get('/location/:location', theaterController.getTheatersByLocation);

// Theater related routes
router.get('/:id/screens', theaterController.getTheaterScreens);
router.get('/:id/showtimes', theaterController.getTheaterShowTimes);

module.exports = router;