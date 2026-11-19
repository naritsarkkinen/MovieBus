const pool = require('../config/database');

async function getCommunities(_req, res, next) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, COUNT(cm.user_id)::int AS member_count
       FROM communities c
       LEFT JOIN community_members cm ON cm.community_id = c.id
       GROUP BY c.id
       ORDER BY c.name`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function createCommunity(req, res, next) {
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();

  if (name.length < 3 || name.length > 100) {
    return res.status(400).json({ error: 'Name must be 3–100 characters.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO communities (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = { getCommunities, createCommunity };
