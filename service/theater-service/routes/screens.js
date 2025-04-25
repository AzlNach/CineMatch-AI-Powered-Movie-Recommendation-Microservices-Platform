const express = require('express');
const router = express.Router();
const screenController = require('../controllers/screenController');

// Screen routes
router.get('/theater/:theaterId', screenController.getScreensByTheaterId);
router.get('/:id', screenController.getScreenById);
router.post('/', screenController.createScreen);
router.put('/:id', screenController.updateScreen);
router.delete('/:id', screenController.deleteScreen);
router.get('/:id/seats', screenController.getScreenSeats);
router.get('/available', screenController.getAvailableScreens);

module.exports = router;