const pool = require('../config/database');
const crypto = require('crypto');

class BookingModel {
  // Generate a unique booking code
  generateBookingCode() {
    return 'BK' + Date.now().toString().slice(-6) + 
           crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  // Create a new booking
  async createBooking(bookingData) {
    const { user_id, schedule_id, seat_id, total_amount } = bookingData;
    const booking_code = this.generateBookingCode();
    
    const [result] = await pool.execute(
      'INSERT INTO bookings (user_id, schedule_id, seat_id, total_amount, booking_code, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [user_id, schedule_id, seat_id, total_amount, booking_code]
    );
    
    return result.insertId;
  }

  // Get booking by ID
  async getBookingById(bookingId) {
    const [rows] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );
    return rows[0];
  }

  // Get bookings by user ID
  async getBookingsByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  // Get booking by booking code
  async getBookingByCode(bookingCode) {
    const [rows] = await pool.execute(
      'SELECT * FROM bookings WHERE booking_code = ?',
      [bookingCode]
    );
    return rows[0];
  }

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    const [result] = await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, bookingId]
    );
    return result.affectedRows > 0;
  }

  // Delete booking (soft delete by setting status to 'cancelled')
  async deleteBooking(bookingId) {
    const [result] = await pool.execute(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [bookingId]
    );
    return result.affectedRows > 0;
  }

  // Check if a seat is already booked for a specific schedule
  async isSeatBooked(scheduleId, seatId) {
    const [rows] = await pool.execute(
      'SELECT * FROM bookings WHERE schedule_id = ? AND seat_id = ? AND status != "cancelled"',
      [scheduleId, seatId]
    );
    return rows.length > 0;
  }

  // Get all bookings for a specific schedule
  async getBookingsBySchedule(scheduleId) {
    const [rows] = await pool.execute(
      'SELECT * FROM bookings WHERE schedule_id = ? AND status != "cancelled"',
      [scheduleId]
    );
    return rows;
  }

  // Get all bookings
  async getAllBookings(limit = 100, offset = 0) {
    const [rows] = await pool.execute(
      'SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }

  // Get booking statistics
  async getBookingStatistics() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(total_amount) as total_revenue
      FROM bookings
    `);
    return rows[0];
  }
}

module.exports = new BookingModel();