const pool = require('../config/database');

async function getMovieReviews(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.user_id, r.movie_id, r.body, r.created_at, u.display_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.movie_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.movieId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function getUserReviews(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.user_id, r.movie_id, m.title, r.body, r.created_at
       FROM reviews r
       JOIN movies m ON m.id = r.movie_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT 30`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function createMovieReview(req, res, next) {
  const body = String(req.body.body || '').trim();
  if (body.length < 1 || body.length > 1500) {
    return res.status(400).json({ error: 'Review must be 1–1500 characters.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, movie_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, req.params.movieId, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23503' || error.code === '22P02') {
      return res.status(400).json({ error: 'Invalid movie ID or movie does not exist.' });
    }
    next(error);
  }
}

module.exports = { getMovieReviews, getUserReviews, createMovieReview };
