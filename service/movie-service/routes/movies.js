const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');


router.get('/', movieController.getAllMovies);
router.post('/', movieController.createMovie);


router.get('/search', movieController.searchMovies);
router.get('/genre/:genre', movieController.getMoviesByGenre);
router.get('/top-rated', movieController.getTopRatedMovies);
router.get('/new-releases', movieController.getNewReleases);
router.get('/upcoming', movieController.getUpcomingMovies);
router.get('/genres', movieController.getAllGenres);



router.post('/:id/reviews', movieController.addReview);
router.get('/:id/reviews', movieController.getMovieReviews);


router.get('/:id', movieController.getMovieById);
router.put('/:id', movieController.updateMovie);
router.delete('/:id', movieController.deleteMovie);

module.exports = router;