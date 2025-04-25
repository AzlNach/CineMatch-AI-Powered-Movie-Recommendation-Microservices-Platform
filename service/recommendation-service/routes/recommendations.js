const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Get personalized recommendations for a user
router.get('/user/:userId', recommendationController.getUserRecommendations);

// Get similar movies to a specific movie
router.get('/similar/:movieId', recommendationController.getSimilarMovies);

// Get trending recommendations
router.get('/trending', recommendationController.getTrendingMovies);

// Analyze booking data
router.post('/analyze', recommendationController.analyzeBookingData);

// Get analysis report
router.get('/analysis/report', recommendationController.getAnalysisReport);

// Track user interaction for improving recommendations
router.post('/interaction', recommendationController.trackUserInteraction);

// Get model performance metrics
router.get('/model/performance', recommendationController.getModelPerformance);

// Get training history
router.get('/training/history', recommendationController.getTrainingHistory);

// Get recommendations from a specific training
router.get('/training/:trainingId/recommendations', recommendationController.getRecommendationsFromTraining);

module.exports = router;