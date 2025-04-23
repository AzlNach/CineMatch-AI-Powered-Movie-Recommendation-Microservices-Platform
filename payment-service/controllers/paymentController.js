const axios = require('axios');

let payments = [];

// Service URLs
const BOOKING_SERVICE = 'http://localhost:3004';

// Process a new payment
exports.processPayment = async (req, res) => {
  const { bookingId, amount, paymentMethod } = req.body;

  if (!bookingId || !amount || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // In a real app, call the booking service to get booking details
    // and process payment through a payment gateway
    
    const paymentId = payments.length + 1;
    const transactionId = 'TRX' + Date.now();
    
    const newPayment = {
      id: paymentId,
      bookingId,
      transactionId,
      amount,
      paymentMethod,
      status: 'completed', // In a real app, this would depend on payment gateway response
      createdAt: new Date().toISOString()
    };
    
    payments.push(newPayment);
    
    // In a real app, call the booking service to confirm the booking
    // await axios.put(`${BOOKING_SERVICE}/bookings/${bookingId}/confirm`);
    
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

// Get payment by ID
exports.getPaymentById = (req, res) => {
  const payment = payments.find(p => p.id == req.params.id);
  payment ? res.json(payment) : res.status(404).json({ error: 'Payment not found' });
};

// Get payment by booking ID
exports.getPaymentByBookingId = (req, res) => {
  const payment = payments.find(p => p.bookingId == req.params.bookingId);
  payment ? res.json(payment) : res.status(404).json({ error: 'Payment not found for booking' });
};

// Verify payment
exports.verifyPayment = (req, res) => {
  const paymentId = parseInt(req.params.id);
  const payment = payments.find(p => p.id === paymentId);
  
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  
  // In a real app, verify payment with payment gateway
  const verified = true;
  
  if (verified) {
    payment.status = 'verified';
    payment.verifiedAt = new Date().toISOString();
    res.json({ success: true, payment });
  } else {
    res.status(400).json({ success: false, error: 'Payment verification failed' });
  }
};

// Get invoice for payment
exports.getInvoice = (req, res) => {
  const paymentId = parseInt(req.params.id);
  const payment = payments.find(p => p.id === paymentId);
  
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  
  // Generate invoice details
  const invoice = {
    invoiceNumber: 'INV-' + payment.id,
    paymentId: payment.id,
    bookingId: payment.bookingId,
    transactionId: payment.transactionId,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    status: payment.status,
    timestamp: payment.createdAt,
    customerInfo: {}, // In a real app, get from booking or user service
    items: [] // In a real app, get from booking service
  };
  
  res.json(invoice);
};