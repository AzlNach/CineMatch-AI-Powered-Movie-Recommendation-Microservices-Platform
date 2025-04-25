const axios = require('axios');
const aiModel = require('../models/aiModel');
const dataAnalyzer = require('../utils/dataAnalyzer');
const UserInteractionModel = require('../models/UserInteractionModel');
const RecommendationModel = require('../models/RecommendationModel');
const UserPreferenceModel = require('../models/UserPreferenceModel');
const ModelPerformanceModel = require('../models/ModelPerformanceModel');
const TrainingDataModel = require('../models/TrainingDataModel');
require('dotenv').config();

// Service endpoints for integration
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const MOVIE_SERVICE = process.env.MOVIE_SERVICE_URL || 'http://localhost:3002';
const BOOKING_SERVICE = process.env.BOOKING_SERVICE_URL || 'http://localhost:3004';
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

// Analysis results storage
let analysisResults = null;

exports.getUserRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if we have stored recommendations first
    const storedRecommendations = await RecommendationModel.getUserRecommendations(userId);
    
    if (storedRecommendations.length >= 5) {
      // Use stored recommendations if we have enough
      const moviesPromises = storedRecommendations.map(rec => 
        axios.get(`${MOVIE_SERVICE}/movies/${rec.movie_id}`)
      );
      
      const movieResponses = await Promise.all(moviesPromises);
      const recommendations = storedRecommendations.map((rec, index) => ({
        recommendation: rec,
        movie: movieResponses[index].data
      }));
      
      return res.json({
        userId,
        recommendations,
        source: "cached",
        generatedAt: new Date().toISOString(),
        modelVersion: aiModel.VERSION
      });
    }
    
    // Otherwise, generate new recommendations
    // Get user data
    const userResponse = await axios.get(`${USER_SERVICE}/users/${userId}`);
    const user = userResponse.data;
    
    // Get all movies
    const moviesResponse = await axios.get(`${MOVIE_SERVICE}/movies`);
    const movies = moviesResponse.data;
    
    // Get user booking history
    const userBookings = await getUserBookingHistory(userId);
    
    // Get user interactions from database
    const userInteractions = await UserInteractionModel.getUserInteractions(userId);
    
    // Get latest training data
    const latestTraining = await TrainingDataModel.getLatestCompletedTraining();
    const trainingId = latestTraining ? latestTraining.id : null;
    
    // Use AI model to generate recommendations
    const recommendations = await aiModel.generateRecommendations(
      user,
      movies,
      userBookings,
      userInteractions,
      trainingId
    );
    
    res.json({
      userId,
      recommendations,
      source: "generated",
      trainingId,
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
    const similarMovies = await aiModel.findSimilarMovies(movie, allMovies);
    
    // Record interaction
    if (req.query.userId) {
      await UserInteractionModel.recordInteraction({
        user_id: req.query.userId,
        movie_id: movieId,
        interaction_type: 'similar_search'
      });
    }
    
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
    
    // Get recent interactions from database
    const recentInteractions = await UserInteractionModel.getRecentInteractions(7);
    
    // Analyze recent bookings to determine trending movies
    const trendingMovies = dataAnalyzer.analyzeTrends(movies, recentInteractions);
    
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

exports.trackUserInteraction = async (req, res) => {
  try {
    const { userId, movieId, interactionType, rating, bookingId, reviewId } = req.body;
    
    if (!userId || !movieId || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Record interaction to database
    const interactionId = await UserInteractionModel.recordInteraction({
      user_id: userId,
      movie_id: movieId,
      booking_id: bookingId || null,
      review_id: reviewId || null,
      interaction_type: interactionType,
      rating: rating || null
    });
    
    // Trigger model retraining if needed (e.g., every 100 new interactions)
    const recentInteractions = await UserInteractionModel.getRecentInteractions(1);
    if (recentInteractions.length % 100 === 0) {
      const trainingResult = await aiModel.retrainModel(recentInteractions);
      
      // Generate new recommendations for all active users
      if (trainingResult.success) {
        // In a real system, you might do this as a background job
        // For now, we'll just acknowledge that training happened
        return res.json({ 
          status: 'success', 
          interactionId,
          message: 'Interaction recorded and new model trained',
          trainingId: trainingResult.trainingId
        });
      }
    }
    
    res.json({ 
      status: 'success', 
      interactionId,
      message: 'Interaction recorded for AI analysis'
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
};

exports.analyzeBookingData = async (req, res) => {
  try {
    // Get all bookings (in a real app, this would call the booking service)
    const bookingResponse = await axios.get(`${BOOKING_SERVICE}/bookings`);
    const bookings = bookingResponse.data;
    
    // Convert bookings to interactions and store them
    for (const booking of bookings) {
      await UserInteractionModel.recordInteraction({
        user_id: booking.user_id,
        movie_id: booking.movie_id,
        booking_id: booking.id,
        interaction_type: 'booking'
      });
    }
    
    // Get all movies
    const moviesResponse = await axios.get(`${MOVIE_SERVICE}/movies`);
    const movies = moviesResponse.data;
    
    // Get all booking-type interactions
    const bookingInteractions = await UserInteractionModel.getRecentInteractions(365, 10000);
    const filteredBookingInteractions = bookingInteractions.filter(
      i => i.interaction_type === 'booking'
    );
    
    // Analyze booking patterns
    const analysis = {
      totalBookings: filteredBookingInteractions.length,
      moviePopularity: analyzeMoviePopularity(filteredBookingInteractions, movies),
      userPreferences: analyzeUserPreferences(filteredBookingInteractions, movies),
      timestamp: new Date().toISOString()
    };
    
    // Store analysis results
    analysisResults = analysis;
    
    // Train a new model with the booking data
    const trainingResult = await aiModel.retrainModel(
      filteredBookingInteractions,
      ['bookings', 'genres', 'ratings']
    );
    
    // Send recommendations to users based on analysis
    await sendRecommendationsToUsers(analysis, trainingResult.trainingId);
    
    res.json({
      success: true,
      message: 'Analysis completed and recommendations sent',
      analysisId: Date.now(),
      trainingId: trainingResult.trainingId
    });
  } catch (error) {
    console.error('Error analyzing booking data:', error);
    res.status(500).json({ error: 'Failed to analyze booking data' });
  }
};

exports.getAnalysisReport = (req, res) => {
  if (!analysisResults) {
    return res.status(404).json({ error: 'No analysis results available' });
  }
  
  res.json(analysisResults);
};

exports.getModelPerformance = async (req, res) => {
  try {
    const performance = await ModelPerformanceModel.getLatestPerformance();
    if (!performance) {
      return res.status(404).json({ error: 'No model performance data available' });
    }
    
    res.json({
      modelVersion: performance.model_version,
      performance: {
        accuracy: performance.accuracy,
        precision: performance.precision_score,
        recall: performance.recall,
        f1Score: performance.f1_score
      },
      trainingTime: performance.training_time,
      parameters: performance.parameters,
      createdAt: performance.created_at
    });
  } catch (error) {
    console.error('Error getting model performance:', error);
    res.status(500).json({ error: 'Failed to get model performance' });
  }
};

// Get training history
exports.getTrainingHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await TrainingDataModel.getTrainingHistory(limit);
    
    res.json(history);
  } catch (error) {
    console.error('Error getting training history:', error);
    res.status(500).json({ error: 'Failed to get training history' });
  }
};

// Get recommendations from a specific training
exports.getRecommendationsFromTraining = async (req, res) => {
  try {
    const trainingId = req.params.trainingId;
    const limit = parseInt(req.query.limit) || 100;
    
    // Verify training exists
    const training = await TrainingDataModel.getTrainingDataById(trainingId);
    if (!training) {
      return res.status(404).json({ error: 'Training data not found' });
    }
    
    const recommendations = await RecommendationModel.getRecommendationsByTrainingId(trainingId, limit);
    
    res.json({
      trainingId,
      modelId: training.model_id,
      createdAt: training.created_at,
      recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations from training:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

// Helper function to get user booking history
async function getUserBookingHistory(userId) {
  try {
    const response = await axios.get(`${BOOKING_SERVICE}/bookings/user/${userId}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching user booking history:', error);
    return [];
  }
}

// Analyze movie popularity from bookings
function analyzeMoviePopularity(bookings, movies) {
  const movieCounts = {};
  
  bookings.forEach(booking => {
    const { movie_id } = booking;
    movieCounts[movie_id] = (movieCounts[movie_id] || 0) + 1;
  });
  
  return Object.entries(movieCounts)
    .map(([movieId, count]) => {
      const movie = movies.find(m => m.id == movieId);
      return {
        movieId: parseInt(movieId),
        title: movie ? movie.title : 'Unknown Movie',
        bookingCount: count
      };
    })
    .sort((a, b) => b.bookingCount - a.bookingCount);
}

// Analyze user preferences from bookings
function analyzeUserPreferences(bookings, movies) {
  const userPreferences = {};
  
  bookings.forEach(booking => {
    const { user_id, movie_id } = booking;
    
    if (!userPreferences[user_id]) {
      userPreferences[user_id] = {
        genres: {},
        movies: []
      };
    }
    
    const movie = movies.find(m => m.id == movie_id);
    
    if (movie) {
      // Add movie to user's watched list
      userPreferences[user_id].movies.push(movie_id);
      
      // Count genre preferences
      movie.genres?.forEach(genre => {
        userPreferences[user_id].genres[genre] = 
          (userPreferences[user_id].genres[genre] || 0) + 1;
      });
    }
  });
  
  return Object.entries(userPreferences).map(([userId, preferences]) => {
    // Find top genres
    const topGenres = Object.entries(preferences.genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre, count]) => ({ genre, count }));
    
    return {
      userId: parseInt(userId),
      movieCount: preferences.movies.length,
      topGenres
    };
  });
}

// Send personalized recommendations to users
async function sendRecommendationsToUsers(analysis, trainingId) {
  try {
    // For each user in the analysis
    for (const userPref of analysis.userPreferences) {
      // Get personalized recommendations
      const userId = userPref.userId;
      
      try {
        const userResponse = await axios.get(`${USER_SERVICE}/users/${userId}`);
        const user = userResponse.data;
        
        const moviesResponse = await axios.get(`${MOVIE_SERVICE}/movies`);
        const movies = moviesResponse.data;
        
        const userBookings = await getUserBookingHistory(userId);
        const userInteractions = await UserInteractionModel.getUserInteractions(userId);
        
        const recommendations = await aiModel.generateRecommendations(
          user,
          movies,
          userBookings,
          userInteractions,
          trainingId
        );
        
        if (recommendations.length > 0) {
          const topRecommendation = recommendations[0];
          
          // Send notification with recommendation
          await axios.post(`${NOTIFICATION_SERVICE}/notifications`, {
            userId,
            type: 'recommendation',
            title: 'Movie Recommendation Just For You!',
            message: `Based on your taste, we think you'll love "${topRecommendation.movie.title}"`
          });
        }
      } catch (err) {
        console.error(`Error processing recommendations for user ${userId}:`, err);
        // Continue with next user
      }
    }
  } catch (error) {
    console.error('Error sending recommendations to users:', error);
  }
}