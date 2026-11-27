const router = require('express').Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { getUserById, updateProfile } = require('../controllers/userController');
const { getUserReviews } = require('../controllers/reviewController');

router.get('/:id', getUserById);

function onlyOwnProfile(req, res, next) {
  if (String(req.user.id) !== String(req.params.id)) {
    return res.status(403).json({ error: 'This action is only available to the profile owner.' });
  }
  next();
}

router.get('/:id/reviews', requireAuth, onlyOwnProfile, getUserReviews);
router.patch('/:id', requireAuth, onlyOwnProfile, updateProfile);
router.patch('/:id/avatar', requireAuth, onlyOwnProfile, updateProfile);

module.exports = router;
