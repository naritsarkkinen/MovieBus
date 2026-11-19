const pool = require('../config/database');

async function getUserById(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, display_name, avatar_emoji, skin, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const displayName = req.body.display_name === undefined
      ? null : String(req.body.display_name).trim();
    const avatarEmoji = req.body.avatar_emoji === undefined ? null : req.body.avatar_emoji;
    const skin = req.body.skin === undefined ? null : req.body.skin;
    const allowedSkins = ['violet', 'blue', 'mint', 'rose', 'gold'];

    if (displayName !== null && (displayName.length < 2 || displayName.length > 40)) {
      return res.status(400).json({ error: 'Display name must be 2–40 characters.' });
    }
    if (skin !== null && !allowedSkins.includes(skin)) {
      return res.status(400).json({ error: 'Invalid skin.' });
    }

    const result = await pool.query(
      `UPDATE users
       SET display_name = COALESCE($1, display_name),
           avatar_emoji = COALESCE($2, avatar_emoji),
           skin = COALESCE($3, skin)
       WHERE id = $4
       RETURNING id, display_name, email, avatar_emoji, skin, created_at`,
      [displayName, avatarEmoji, skin, req.user.id]
    );

    if (!result.rowCount) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = { getUserById, updateProfile };
