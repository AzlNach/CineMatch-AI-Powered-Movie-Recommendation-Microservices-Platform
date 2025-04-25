const PaymentModel = require('../models/PaymentModel');
const axios = require('axios');
require('dotenv').config();

// Service URLs
const BOOKING_SERVICE = process.env.BOOKING_SERVICE_URL || 'http://localhost:3004';
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

// Process a new payment
exports.processPayment = async (req, res) => {
  try {
    // Your existing payment processing code
    
    // Get booking details to include user_id
    const bookingResponse = await axios.get(`${BOOKING_SERVICE}/bookings/${bookingId}`);
    const booking = bookingResponse.data;
    
    // After updating payment status to completed
    await PaymentModel.updatePaymentStatus(paymentId, 'completed');
    
    // Send notification for successful payment
    try {
      await axios.post(`${notificationServiceUrl}/notifications`, {
        userId: booking.user_id,
        paymentId: paymentId,
        type: 'payment_successful',
        title: 'Payment Successful',
        message: `Your payment of $${amount} for booking #${booking.booking_code} was successful!`
      });
      console.log(`Notification sent for payment #${paymentId}`);
    } catch (error) {
      console.error('Failed to send notification:', error.message);
      // Continue execution even if notification fails
    }
    
    // The rest of your code
    res.status(201).json(payment);
  } catch (error) {
    // Error handling
    
    // Optionally send failure notification
    try {
      if (bookingId && userId) {
        await axios.post(`${notificationServiceUrl}/notifications`, {
          userId: userId,
          bookingId: bookingId,
          type: 'payment_failed',
          title: 'Payment Failed',
          message: 'There was an issue processing your payment. Please try again.'
        });
      }
    } catch (notificationError) {
      console.error('Failed to send failure notification:', notificationError.message);
    }
    
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await PaymentModel.getPaymentById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get payment by booking ID
exports.getPaymentByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const payment = await PaymentModel.getPaymentByBookingId(bookingId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found for booking' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error getting payment by booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    // Your existing verification code
    
    // After updating payment status to verified
    await PaymentModel.updatePaymentStatus(paymentId, 'verified');
    
    // Get payment details
    const payment = await PaymentModel.getPaymentById(paymentId);
    
    // Get booking details to get user_id
    const bookingResponse = await axios.get(`${BOOKING_SERVICE}/bookings/${payment.booking_id}`);
    const booking = bookingResponse.data;
    
    // Send notification for payment verification
    try {
      await axios.post(`${notificationServiceUrl}/notifications`, {
        userId: booking.user_id,
        paymentId: paymentId,
        type: 'payment_verified',
        title: 'Payment Verified',
        message: `Your payment for booking #${booking.booking_code} has been verified.`
      });
      console.log(`Verification notification sent for payment #${paymentId}`);
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }
    
    // Return success response
    res.json({ success: true, payment: updatedPayment });
  } catch (error) {
    // Error handling
    res.status(500).json({ error: 'Server error' });
  }
};

// Get invoice for payment
exports.getInvoice = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await PaymentModel.getPaymentById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Get booking details
    let booking = null;
    try {
      const bookingResponse = await axios.get(`${BOOKING_SERVICE}/bookings/${payment.booking_id}`);
      booking = bookingResponse.data;
    } catch (error) {
      console.error('Error getting booking details:', error);
      // Continue anyway, the invoice can still be generated
    }
    
    // Generate invoice
    const invoice = {
      invoiceNumber: 'INV-' + payment.id,
      paymentId: payment.id,
      bookingId: payment.booking_id,
      transactionId: payment.transaction_id,
      amount: payment.amount,
      paymentMethod: payment.payment_method,
      status: payment.status,
      timestamp: payment.payment_date,
      customerInfo: booking ? {
        userId: booking.user_id
      } : {},
      items: [{
        description: 'Movie Ticket',
        quantity: 1,
        amount: payment.amount
      }]
    };
    
    res.json(invoice);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a new endpoint to get all payments (admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const payments = await PaymentModel.getAllPayments(limit, offset);
    res.json(payments);
  } catch (error) {
    console.error('Error getting all payments:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a new endpoint to get payment statistics (admin only)
exports.getPaymentStatistics = async (req, res) => {
  try {
    const statistics = await PaymentModel.getPaymentStatistics();
    res.json(statistics);
  } catch (error) {
    console.error('Error getting payment statistics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};