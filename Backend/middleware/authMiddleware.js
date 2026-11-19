const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Authentication is not configured.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    const result = await pool.query(
      'SELECT id, display_name, email, avatar_emoji, skin FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rowCount) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
    next(error);
  }
}

module.exports = { requireAuth };
