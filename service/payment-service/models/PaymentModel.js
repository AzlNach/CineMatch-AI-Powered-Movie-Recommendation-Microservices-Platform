const pool = require('../config/database');
const crypto = require('crypto');

class PaymentModel {
  // Generate a transaction ID
  generateTransactionId() {
    return 'TRX' + Date.now().toString().slice(-6) + 
           crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  // Process a new payment
  async createPayment(paymentData) {
    const { booking_id, amount, payment_method } = paymentData;
    const transaction_id = this.generateTransactionId();
    
    const [result] = await pool.execute(
      'INSERT INTO payments (booking_id, transaction_id, amount, payment_method, status) VALUES (?, ?, ?, ?, "pending")',
      [booking_id, transaction_id, amount, payment_method]
    );
    
    return {
      id: result.insertId,
      transaction_id
    };
  }

  // Get payment by ID
  async getPaymentById(paymentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE id = ?',
      [paymentId]
    );
    return rows[0];
  }

  // Get payment by booking ID
  async getPaymentByBookingId(bookingId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE booking_id = ?',
      [bookingId]
    );
    return rows[0];
  }

  // Get payment by transaction ID
  async getPaymentByTransactionId(transactionId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE transaction_id = ?',
      [transactionId]
    );
    return rows[0];
  }

  // Update payment status
  async updatePaymentStatus(paymentId, status) {
    const [result] = await pool.execute(
      'UPDATE payments SET status = ? WHERE id = ?',
      [status, paymentId]
    );
    return result.affectedRows > 0;
  }

  // Get all payments with pagination
  async getAllPayments(limit = 100, offset = 0) {
    const [rows] = await pool.execute(
      'SELECT * FROM payments ORDER BY payment_date DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }

  // Get payment statistics
  async getPaymentStatistics() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' OR status = 'verified' THEN 1 ELSE 0 END) as successful_payments,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
        SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded_payments,
        SUM(CASE WHEN status = 'completed' OR status = 'verified' THEN amount ELSE 0 END) as total_revenue
      FROM payments
    `);
    return rows[0];
  }
}

module.exports = new PaymentModel();