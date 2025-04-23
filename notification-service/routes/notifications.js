const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Notification endpoints
router.post('/', notificationController.sendNotification);
router.get('/user/:userId', notificationController.getUserNotifications);
router.post('/send-push', notificationController.sendPushNotification);

module.exports = router;