const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Authentication endpoints
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// User management endpoints
router.put('/me', userController.updateProfile);
router.patch('/me/password', userController.updatePassword);
router.delete('/me', userController.deleteAccount);

// User history endpoints
router.get('/me/history', userController.getUserHistory);
router.get('/me/bookings', userController.getUserBookings);

// Get user by ID (internal use)
router.get('/:id', userController.getUserById);

module.exports = router;