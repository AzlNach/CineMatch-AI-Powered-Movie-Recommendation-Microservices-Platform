const MovieModel = require('../models/MovieModel');
const axios = require('axios');

// Get all movies
exports.getAllMovies = async (req, res) => {
  try {
    const movies = await MovieModel.getAllMovies();
    res.json(movies);
  } catch (error) {
    console.error('Error in getAllMovies:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get movie by ID
exports.getMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await MovieModel.getMovieById(movieId);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json(movie);
  } catch (error) {
    console.error('Error in getMovieById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new movie
exports.createMovie = async (req, res) => {
  try {
    const movieData = req.body;
    
    if (!movieData.title) {
      return res.status(400).json({ error: 'Movie title is required' });
    }
    
    const movieId = await MovieModel.createMovie(movieData);
    const movie = await MovieModel.getMovieById(movieId);
    
    res.status(201).json(movie);
  } catch (error) {
    console.error('Error in createMovie:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update movie
exports.updateMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movieData = req.body;
    
    const movie = await MovieModel.getMovieById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Merge existing data with updates
    const updatedData = { ...movie, ...movieData };
    delete updatedData.id; // Don't include ID in the update data
    delete updatedData.genres; // Will be handled separately
    
    const updated = await MovieModel.updateMovie(movieId, {
      ...updatedData,
      genres: movieData.genres // Only use new genres if provided
    });
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update movie' });
    }
    
    const updatedMovie = await MovieModel.getMovieById(movieId);
    res.json(updatedMovie);
  } catch (error) {
    console.error('Error in updateMovie:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete movie
exports.deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await MovieModel.getMovieById(movieId);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    const deleted = await MovieModel.deleteMovie(movieId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete movie' });
    }
    
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMovie:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Search movies
exports.searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const movies = await MovieModel.searchMovies(q);
    res.json(movies);
  } catch (error) {
    console.error('Error in searchMovies:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get movies by genre
exports.getMoviesByGenre = async (req, res) => {
  try {
    const genre = req.params.genre;
    const movies = await MovieModel.getMoviesByGenre(genre);
    res.json(movies);
  } catch (error) {
    console.error('Error in getMoviesByGenre:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get top rated movies
exports.getTopRatedMovies = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const movies = await MovieModel.getTopRatedMovies(limit);
    res.json(movies);
  } catch (error) {
    console.error('Error in getTopRatedMovies:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get new releases
exports.getNewReleases = async (req, res) => {
  try {
    const movies = await MovieModel.getNewReleases();
    res.json(movies);
  } catch (error) {
    console.error('Error in getNewReleases:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get upcoming movies
exports.getUpcomingMovies = async (req, res) => {
  try {
    const movies = await MovieModel.getUpcomingMovies();
    res.json(movies);
  } catch (error) {
    console.error('Error in getUpcomingMovies:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all genres
exports.getAllGenres = async (req, res) => {
  try {
    const genres = await MovieModel.getAllGenres();
    res.json(genres);
  } catch (error) {
    console.error('Error in getAllGenres:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add movie review
exports.addReview = async (req, res) => {
  try {
    const movieId = req.params.id;
    const { userId, rating, comment } = req.body;
    
    if (!userId || !rating) {
      return res.status(400).json({ error: 'User ID and rating are required' });
    }
    
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }
    
    const movie = await MovieModel.getMovieById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Check if user exists (optional, would require API call to user service)
    try {
      const userResponse = await axios.get(`http://localhost:3001/users/${userId}`);
      if (!userResponse.data) {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      // Continue anyway if user service is down
      console.error('Error validating user:', err);
    }
    
    const reviewId = await MovieModel.addReview(movieId, userId, rating, comment);
    const updatedMovie = await MovieModel.getMovieById(movieId);
    
    res.status(201).json({
      message: 'Review added successfully',
      reviewId,
      movie: updatedMovie
    });
  } catch (error) {
    console.error('Error in addReview:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get movie reviews
exports.getMovieReviews = async (req, res) => {
  try {
    const movieId = req.params.id;
    
    const movie = await MovieModel.getMovieById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    const reviews = await MovieModel.getMovieReviews(movieId);
    
    // Enhance reviews with user details (optional, would require API calls to user service)
    // const enhancedReviews = await Promise.all(reviews.map(async (review) => {
    //   try {
    //     const userResponse = await axios.get(`http://localhost:3001/users/${review.user_id}`);
    //     return { ...review, user: userResponse.data };
    //   } catch (err) {
    //     return { ...review, user: { id: review.user_id } };
    //   }
    // }));
    
    res.json(reviews);
  } catch (error) {
    console.error('Error in getMovieReviews:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Generate movie recommendations for a user
exports.generateRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // In a real app, this would use AI algorithms to generate personalized recommendations
    // For now, just return top rated movies as recommendations with random scores
    const topRatedMovies = await MovieModel.getTopRatedMovies(20);
    
    // Save recommendations to the database with random scores
    for (const movie of topRatedMovies) {
      const score = (Math.random() * 5 + 5).toFixed(2); // Random score between 5 and 10
      await MovieModel.saveRecommendation(userId, movie.id, score);
    }
    
    // Get the saved recommendations
    const recommendations = await MovieModel.getUserRecommendations(userId);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error in generateRecommendations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's saved recommendations
exports.getUserRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    const recommendations = await MovieModel.getUserRecommendations(userId, limit);
    res.json(recommendations);
  } catch (error) {
    console.error('Error in getUserRecommendations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};