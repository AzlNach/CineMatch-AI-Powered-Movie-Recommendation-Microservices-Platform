const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

// Genre CRUD
router.get('/', genreController.getAllGenres);
router.post('/', genreController.createGenre);
router.get('/:id', genreController.getGenreById);
router.put('/:id', genreController.updateGenre);
router.delete('/:id', genreController.deleteGenre);

// Get movies by genre
router.get('/:id/movies', genreController.getMoviesByGenre);

module.exports = router;