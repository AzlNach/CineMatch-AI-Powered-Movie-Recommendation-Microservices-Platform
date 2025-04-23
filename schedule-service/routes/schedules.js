const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Get all schedules
router.get('/', scheduleController.getAllSchedules);

// Get schedule by ID
router.get('/:id', scheduleController.getScheduleById);

// Get schedules by movie ID
router.get('/movie/:movieId', scheduleController.getSchedulesByMovie);

// Get schedules by date
router.get('/date/:date', scheduleController.getSchedulesByDate);

// Admin endpoints
router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;