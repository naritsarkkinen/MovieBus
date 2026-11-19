const pool = require('../config/database');

async function saveRating(req, res, next) {
  const score = Number(req.body.score);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return res.status(400).json({ error: 'Score must be an integer from 1 to 5.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ratings (user_id, movie_id, score)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, movie_id)
       DO UPDATE SET score = EXCLUDED.score
       RETURNING *`,
      [req.user.id, req.params.movieId, score]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23503' || error.code === '22P02') {
      return res.status(400).json({ error: 'Invalid movie ID or movie does not exist.' });
    }
    next(error);
  }
}

module.exports = { saveRating };
