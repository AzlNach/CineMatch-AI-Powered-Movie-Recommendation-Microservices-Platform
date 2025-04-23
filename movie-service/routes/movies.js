const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Get all movies
router.get('/', movieController.getAllMovies);

// Get now showing movies
router.get('/now-showing', movieController.getNowShowingMovies);

// Get coming soon movies
router.get('/coming-soon', movieController.getComingSoonMovies);

// Get all genres
router.get('/genres', movieController.getAllGenres);

// Get all ratings
router.get('/ratings', movieController.getAllRatings);

// Get movie by ID (make sure this is after the special routes)
router.get('/:id', movieController.getMovieById);

// Search movies
router.get('/search', movieController.searchMovies);

// Add movies
router.post('/', movieController.addMovies);

// Update movie
router.put('/:id', movieController.updateMovie);

// Delete movie
router.delete('/:id', movieController.deleteMovie);

module.exports = router;