const pool = require('../config/database');

async function getMovies(req, res, next) {
  try {
    const rawSearch = String(req.query.search || '').trim();
    const search = `%${rawSearch}%`;
    const genre = String(req.query.genre || '');

    const result = await pool.query(
      `SELECT m.id, m.title, m.release_year, m.genre, m.description, m.poster_emoji,
              ROUND(AVG(r.score)::numeric, 1) AS average_rating,
              COUNT(r.id)::int AS rating_count
       FROM movies m
       LEFT JOIN ratings r ON r.movie_id = m.id
       WHERE ($1 = '' OR m.title ILIKE $2 OR m.genre ILIKE $2)
         AND ($3 = '' OR m.genre = $3)
       GROUP BY m.id
       ORDER BY m.title`,
      [rawSearch, search, genre]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function getMovieById(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT m.*,
              ROUND(AVG(r.score)::numeric, 1) AS average_rating,
              COUNT(r.id)::int AS rating_count
       FROM movies m
       LEFT JOIN ratings r ON r.movie_id = m.id
       WHERE m.id = $1
       GROUP BY m.id`,
      [req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Movie not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = { getMovies, getMovieById };
