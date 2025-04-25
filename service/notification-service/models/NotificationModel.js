const pool = require('../config/database');

class NotificationModel {
  // Create a new payment notification
  async createPaymentNotification(notificationData) {
    const { user_id, payment_id, type, title, message } = notificationData;
    
    const [result] = await pool.execute(
      'INSERT INTO payment_notifications (user_id, payment_id, type, title, message) VALUES (?, ?, ?, ?, ?)',
      [user_id, payment_id, type, title, message]
    );
    
    return result.insertId;
  }

  // Create a new booking notification
  async createBookingNotification(notificationData) {
    const { user_id, booking_id, type, title, message } = notificationData;
    
    const [result] = await pool.execute(
      'INSERT INTO booking_notifications (user_id, booking_id, type, title, message) VALUES (?, ?, ?, ?, ?)',
      [user_id, booking_id, type, title, message]
    );
    
    return result.insertId;
  }

  // Get payment notifications for a user
  async getPaymentNotificationsByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  // Get booking notifications for a user
  async getBookingNotificationsByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM booking_notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  // Get all notifications for a user (both payment and booking)
  async getAllNotificationsByUserId(userId) {
    const paymentNotifications = await this.getPaymentNotificationsByUserId(userId);
    const bookingNotifications = await this.getBookingNotificationsByUserId(userId);
    
    // Combine and sort by created_at in descending order
    return [...paymentNotifications, ...bookingNotifications]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Mark payment notification as read
  async markPaymentNotificationAsRead(notificationId) {
    const [result] = await pool.execute(
      'UPDATE payment_notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
    return result.affectedRows > 0;
  }

  // Mark booking notification as read
  async markBookingNotificationAsRead(notificationId) {
    const [result] = await pool.execute(
      'UPDATE booking_notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
    return result.affectedRows > 0;
  }

  // Get payment notification by ID
  async getPaymentNotificationById(notificationId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_notifications WHERE id = ?',
      [notificationId]
    );
    return rows[0];
  }

  // Get booking notification by ID
  async getBookingNotificationById(notificationId) {
    const [rows] = await pool.execute(
      'SELECT * FROM booking_notifications WHERE id = ?',
      [notificationId]
    );
    return rows[0];
  }

  // Get unread notifications count for a user
  async getUnreadNotificationsCount(userId) {
    const [paymentRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM payment_notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    const [bookingRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM booking_notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    return {
      total: paymentRows[0].count + bookingRows[0].count,
      payment: paymentRows[0].count,
      booking: bookingRows[0].count
    };
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId) {
    const [paymentResult] = await pool.execute(
      'UPDATE payment_notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    const [bookingResult] = await pool.execute(
      'UPDATE booking_notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    return {
      total: paymentResult.affectedRows + bookingResult.affectedRows,
      payment: paymentResult.affectedRows,
      booking: bookingResult.affectedRows
    };
  }
}

module.exports = new NotificationModel();