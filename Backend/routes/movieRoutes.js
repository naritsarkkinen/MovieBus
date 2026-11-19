const router = require('express').Router();
const { getMovies, getMovieById } = require('../controllers/movieController');
const { getMovieReviews, createMovieReview } = require('../controllers/reviewController');
const { saveRating } = require('../controllers/ratingController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', getMovies);
router.get('/:id', getMovieById);
router.get('/:movieId/reviews', getMovieReviews);
router.post('/:movieId/reviews', requireAuth, createMovieReview);
router.post('/:movieId/ratings', requireAuth, saveRating);

module.exports = router;
