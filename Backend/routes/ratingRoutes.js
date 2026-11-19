const router = require('express').Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { saveRating } = require('../controllers/ratingController');

router.post('/movies/:movieId', requireAuth, saveRating);

module.exports = router;
