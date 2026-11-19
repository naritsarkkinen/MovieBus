const router = require('express').Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { createMovieReview } = require('../controllers/reviewController');

router.post('/movies/:movieId', requireAuth, createMovieReview);

module.exports = router;
