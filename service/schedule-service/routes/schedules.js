const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Schedule routes
router.get('/', scheduleController.getAllSchedules);
router.get('/movie/:movieId', scheduleController.getSchedulesByMovie);
router.get('/theater/:theaterId', scheduleController.getSchedulesByTheater);
router.get('/date/:date', scheduleController.getSchedulesByDate);
router.get('/:id', scheduleController.getScheduleById);
router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);
router.patch('/:id/seats', scheduleController.updateAvailableSeats);

module.exports = router;