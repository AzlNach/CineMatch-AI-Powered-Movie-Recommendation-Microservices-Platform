const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Notification endpoints
router.post('/', notificationController.sendNotification);
router.get('/user/:userId', notificationController.getUserNotifications);
router.post('/send-push', notificationController.sendPushNotification);
router.put('/:id/read', notificationController.markNotificationAsRead);
router.get('/user/:userId/unread', notificationController.getUnreadCount);
router.put('/user/:userId/read-all', notificationController.markAllAsRead);

module.exports = router;