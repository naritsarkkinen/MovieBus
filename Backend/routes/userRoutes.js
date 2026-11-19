const router = require('express').Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { getUserById, updateProfile } = require('../controllers/userController');

router.get('/:id', getUserById);

function onlyOwnProfile(req, res, next) {
  if (String(req.user.id) !== String(req.params.id)) {
    return res.status(403).json({ error: 'You can only update your own profile.' });
  }
  next();
}

router.patch('/:id', requireAuth, onlyOwnProfile, updateProfile);
router.patch('/:id/avatar', requireAuth, onlyOwnProfile, updateProfile);

module.exports = router;
