const axios = require('axios');
const aiModel = require('../models/aiModel');
const dataAnalyzer = require('../utils/dataAnalyzer');

// Service endpoints for integration
const USER_SERVICE = 'http://localhost:3001';
const MOVIE_SERVICE = 'http://localhost:3002';
const BOOKING_SERVICE = 'http://localhost:3004';
const NOTIFICATION_SERVICE = 'http://localhost:3006';

// Store user interactions for AI analysis
const userInteractions = [];
let analysisResults = null;

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

exports.analyzeBookingData = async (req, res) => {
  try {
    // Get all bookings (in a real app, this would call the booking service)
    // For now, use the interactions that represent bookings
    const bookingInteractions = userInteractions.filter(
      i => i.interactionType === 'booking'
    );
    
    // Get all movies
    const moviesResponse = await axios.get(`${MOVIE_SERVICE}/movies`);
    const movies = moviesResponse.data;
    
    // Analyze booking patterns
    const analysis = {
      totalBookings: bookingInteractions.length,
      moviePopularity: analyzeMoviePopularity(bookingInteractions, movies),
      userPreferences: analyzeUserPreferences(bookingInteractions, movies),
      timestamp: new Date().toISOString()
    };
    
    // Store analysis results
    analysisResults = analysis;
    
    // Send recommendations to users based on analysis
    await sendRecommendationsToUsers(analysis);
    
    res.json({
      success: true,
      message: 'Analysis completed and recommendations sent',
      analysisId: Date.now()
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

// Analyze movie popularity from bookings
function analyzeMoviePopularity(bookings, movies) {
  const movieCounts = {};
  
  bookings.forEach(booking => {
    const { movieId } = booking;
    movieCounts[movieId] = (movieCounts[movieId] || 0) + 1;
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
    const { userId, movieId } = booking;
    
    if (!userPreferences[userId]) {
      userPreferences[userId] = {
        genres: {},
        movies: []
      };
    }
    
    const movie = movies.find(m => m.id == movieId);
    
    if (movie) {
      // Add movie to user's watched list
      userPreferences[userId].movies.push(movieId);
      
      // Count genre preferences
      movie.genres.forEach(genre => {
        userPreferences[userId].genres[genre] = 
          (userPreferences[userId].genres[genre] || 0) + 1;
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
async function sendRecommendationsToUsers(analysis) {
  try {
    // For each user in the analysis
    for (const userPref of analysis.userPreferences) {
      // Get personalized recommendations
      const userId = userPref.userId;
      const userResponse = await axios.get(`${USER_SERVICE}/users/${userId}`);
      const user = userResponse.data;
      
      const moviesResponse = await axios.get(`${MOVIE_SERVICE}/movies`);
      const movies = moviesResponse.data;
      
      const userBookings = userInteractions.filter(
        i => i.userId == userId && i.interactionType === 'booking'
      );
      
      const recommendations = aiModel.generateRecommendations(
        user,
        movies,
        userBookings,
        userInteractions.filter(i => i.userId == userId)
      );
      
      if (recommendations.length > 0) {
        // Send notification with recommendations
        const topRecommendation = recommendations[0];
        
        await axios.post(`${NOTIFICATION_SERVICE}/notifications`, {
          userId,
          type: 'recommendation',
          title: 'Movie Recommendation Just For You!',
          message: `Based on your taste, we think you'll love "${topRecommendation.movie.title}"`
        });
      }
    }
  } catch (error) {
    console.error('Error sending recommendations to users:', error);
  }
}