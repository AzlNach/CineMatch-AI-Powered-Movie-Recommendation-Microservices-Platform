const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Get personalized recommendations for a user
router.get('/user/:userId', recommendationController.getUserRecommendations);

// Get similar movies to a specific movie
router.get('/similar/:movieId', recommendationController.getSimilarMovies);

// Get trending recommendations
router.get('/trending', recommendationController.getTrendingMovies);

// Track user interaction for improving recommendations
router.post('/interaction', recommendationController.trackUserInteraction);

module.exports = router;