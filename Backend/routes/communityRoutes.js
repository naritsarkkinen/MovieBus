const router = require('express').Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { getCommunities, createCommunity } = require('../controllers/communityController');

router.get('/', getCommunities);
router.post('/', requireAuth, createCommunity);

module.exports = router;
