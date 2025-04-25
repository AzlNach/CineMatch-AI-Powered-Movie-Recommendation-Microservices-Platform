const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Payment endpoints
router.post('/', paymentController.processPayment);
router.get('/:id', paymentController.getPaymentById);
router.get('/booking/:bookingId', paymentController.getPaymentByBookingId);
router.post('/:id/verify', paymentController.verifyPayment);
router.get('/:id/invoice', paymentController.getInvoice);

// Admin endpoints
router.get('/', paymentController.getAllPayments);
router.get('/statistics/summary', paymentController.getPaymentStatistics);

module.exports = router;