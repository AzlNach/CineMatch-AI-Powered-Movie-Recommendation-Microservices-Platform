const axios = require('axios');
const aiModel = require('../models/aiModel');
const dataAnalyzer = require('../utils/dataAnalyzer');

// Service endpoints for integration
const USER_SERVICE = 'http://localhost:3001';
const MOVIE_SERVICE = 'http://localhost:3002';
const BOOKING_SERVICE = 'http://localhost:3004';

// Store user interactions for AI analysis
const userInteractions = [];

exports.getUserRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user data
    const userResponse = await axios.get(`${USER_SERVICE}/users/${userId}`);
    const user = userResponse.data;
    
    // Get all movies
    const moviesResponse = await axios.get(`${MOVIE_SERVICE}/movies`);
    const movies = moviesResponse.data;
    
    // Get user booking history
    const userBookings = await getUserBookingHistory(userId);
    
    // Use AI model to generate recommendations
    const recommendations = aiModel.generateRecommendations(
      user,
      movies,
      userBookings,
      userInteractions.filter(i => i.userId == userId)
    );
    
    res.json({
      userId,
      recommendations,
      generatedAt: new Date().toISOString(),
      modelVersion: aiModel.VERSION
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

exports.getSimilarMovies = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    
    // Get target movie data
    const movieResponse = await axios.get(`${MOVIE_SERVICE}/movies/${movieId}`);
    const movie = movieResponse.data;
    
    // Get all movies for comparison
    const moviesResponse = await axios.get(`${MOVIE_SERVICE}/movies`);
    const allMovies = moviesResponse.data;
    
    // Generate similarity using content-based filtering
    const similarMovies = aiModel.findSimilarMovies(movie, allMovies);
    
    res.json({
      movieId,
      similarMovies,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error finding similar movies:', error);
    res.status(500).json({ error: 'Failed to find similar movies' });
  }
};

exports.getTrendingMovies = async (req, res) => {
  try {
    // Get all movies
    const moviesResponse = await axios.get(`${MOVIE_SERVICE}/movies`);
    const movies = moviesResponse.data;
    
    // Analyze recent bookings to determine trending movies
    const trendingMovies = dataAnalyzer.analyzeTrends(movies, userInteractions);
    
    res.json({
      trending: trendingMovies,
      timeframe: '7 days',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating trending recommendations:', error);
    res.status(500).json({ error: 'Failed to generate trending recommendations' });
  }
};

exports.trackUserInteraction = (req, res) => {
  const { userId, movieId, interactionType, rating, timestamp } = req.body;
  
  if (!userId || !movieId || !interactionType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const interaction = {
    userId,
    movieId,
    interactionType, // view, click, book, rate, etc.
    rating: rating || null,
    timestamp: timestamp || new Date().toISOString()
  };
  
  userInteractions.push(interaction);
  
  // Trigger model retraining if needed
  if (userInteractions.length % 10 === 0) {
    aiModel.retrainModel(userInteractions);
  }
  
  res.json({ 
    status: 'success', 
    message: 'Interaction recorded for AI analysis'
  });
};

// Helper function to get user booking history
async function getUserBookingHistory(userId) {
  try {
    // In a real system, this would query the booking service
    // For now, filter the local interactions that represent bookings
    return userInteractions.filter(
      i => i.userId == userId && i.interactionType === 'booking'
    );
  } catch (error) {
    console.error('Error fetching user booking history:', error);
    return [];
  }
}