const NotificationModel = require('../models/NotificationModel');
const axios = require('axios');
require('dotenv').config();

// Service URLs from environment variables
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const BOOKING_SERVICE = process.env.BOOKING_SERVICE_URL || 'http://localhost:3004';
const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';

// Send notification
exports.sendNotification = async (req, res) => {
  try {
    const { userId, type, title, message, bookingId, paymentId } = req.body;
    
    if (!userId || !type || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let notificationId;
    
    // Verify user exists
    try {
      const userResponse = await axios.get(`${USER_SERVICE}/users/${userId}`);
      if (!userResponse.data) {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      // Continue anyway if user service is down
    }
    
    // Determine notification type and save accordingly
    if (paymentId) {
      // Verify payment exists
      try {
        const paymentResponse = await axios.get(`${PAYMENT_SERVICE}/payments/${paymentId}`);
        if (!paymentResponse.data) {
          return res.status(404).json({ error: 'Payment not found' });
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        // Continue anyway if payment service is down
      }
      
      notificationId = await NotificationModel.createPaymentNotification({
        user_id: userId,
        payment_id: paymentId,
        type,
        title: title || type,
        message
      });
    } else if (bookingId) {
      // Verify booking exists
      try {
        const bookingResponse = await axios.get(`${BOOKING_SERVICE}/bookings/${bookingId}`);
        if (!bookingResponse.data) {
          return res.status(404).json({ error: 'Booking not found' });
        }
      } catch (error) {
        console.error('Error verifying booking:', error);
        // Continue anyway if booking service is down
      }
      
      notificationId = await NotificationModel.createBookingNotification({
        user_id: userId,
        booking_id: bookingId,
        type,
        title: title || type,
        message
      });
    } else {
      return res.status(400).json({ error: 'Either bookingId or paymentId is required' });
    }
    
    // Get the created notification
    let notification;
    if (paymentId) {
      notification = await NotificationModel.getPaymentNotificationById(notificationId);
    } else {
      notification = await NotificationModel.getBookingNotificationById(notificationId);
    }
    
    console.log(`Sending notification to user ${userId}: ${title} - ${message}`);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error in sendNotification:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify user exists
    try {
      const userResponse = await axios.get(`${USER_SERVICE}/users/${userId}`);
      if (!userResponse.data) {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      // Continue anyway if user service is down
    }
    
    const notifications = await NotificationModel.getAllNotificationsByUserId(userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Send push notification (simulated)
exports.sendPushNotification = async (req, res) => {
  try {
    const { userId, title, message, data, bookingId, paymentId } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // In a real app, this would use a push notification service
    // like Firebase Cloud Messaging
    console.log(`Sending push notification to user ${userId}: ${title} - ${message}`);
    
    // Save the notification in the database
    if (paymentId) {
      await NotificationModel.createPaymentNotification({
        user_id: userId,
        payment_id: paymentId,
        type: 'push',
        title,
        message
      });
    } else if (bookingId) {
      await NotificationModel.createBookingNotification({
        user_id: userId,
        booking_id: bookingId,
        type: 'push',
        title,
        message
      });
    } else {
      return res.status(400).json({ error: 'Either bookingId or paymentId is required' });
    }
    
    res.json({ 
      success: true, 
      message: `Push notification sent to user ${userId}`,
      data
    });
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    
    let success = false;
    
    if (type === 'payment') {
      success = await NotificationModel.markPaymentNotificationAsRead(id);
    } else if (type === 'booking') {
      success = await NotificationModel.markBookingNotificationAsRead(id);
    } else {
      return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const counts = await NotificationModel.getUnreadNotificationsCount(userId);
    res.json(counts);
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await NotificationModel.markAllNotificationsAsRead(userId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ error: 'Server error' });
  }
};