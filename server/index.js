require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()
const port = process.env.PORT || 4000
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }) }
  catch { res.status(503).json({ status: 'error', database: 'unavailable' }) }
})

app.get('/api/movies', async (req, res) => {
  const search = `%${(req.query.search || '').trim()}%`
  const genre = req.query.genre || ''
  try {
    const result = await pool.query(
      `SELECT m.id,m.title,m.release_year,m.genre,m.description,m.poster_emoji,
       ROUND(AVG(r.score)::numeric,1) AS average_rating,COUNT(r.id)::int AS rating_count
       FROM movies m LEFT JOIN ratings r ON r.movie_id=m.id
       WHERE ($1='' OR m.title ILIKE $2 OR m.genre ILIKE $2)
       AND ($3='' OR m.genre=$3)
       GROUP BY m.id ORDER BY m.title`,
      [req.query.search || '', search, genre]
    )
    res.json(result.rows)
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not load movies' }) }
})

app.get('/api/movies/:id', async (req,res) => {
  try {
    const result = await pool.query(
      `SELECT m.*,ROUND(AVG(r.score)::numeric,1) AS average_rating,COUNT(r.id)::int AS rating_count
       FROM movies m LEFT JOIN ratings r ON r.movie_id=m.id WHERE m.id=$1 GROUP BY m.id`,
      [req.params.id])
    if (!result.rowCount) return res.status(404).json({error:'Movie not found'})
    res.json(result.rows[0])
  } catch(e) { res.status(500).json({error:'Could not load movie'}) }
})

app.post('/api/movies/:id/ratings', async (req,res) => {
  const { user_id, score } = req.body
  if (!Number.isInteger(Number(user_id)) || !Number.isInteger(Number(score)) || score < 1 || score > 5)
    return res.status(400).json({error:'user_id and score (1–5) are required'})
  try {
    const result = await pool.query(
      `INSERT INTO ratings(user_id,movie_id,score) VALUES($1,$2,$3)
       ON CONFLICT(user_id,movie_id) DO UPDATE SET score=EXCLUDED.score RETURNING *`,
      [user_id,req.params.id,score])
    res.status(201).json(result.rows[0])
  } catch(e) { res.status(400).json({error:'Could not save rating. Check that user and movie exist.'}) }
})

app.get('/api/communities', async (_req,res) => {
  try {
    const result = await pool.query(
      `SELECT c.id,c.name,c.description,COUNT(cm.user_id)::int AS member_count
       FROM communities c LEFT JOIN community_members cm ON cm.community_id=c.id
       GROUP BY c.id ORDER BY c.name`)
    res.json(result.rows)
  } catch(e) { res.status(500).json({error:'Could not load communities'}) }
})

app.post('/api/communities', async (req,res) => {
  const name = (req.body.name || '').trim()
  const description = (req.body.description || '').trim()
  if (name.length < 3 || name.length > 100) return res.status(400).json({error:'Name must be 3–100 characters'})
  try {
    const result = await pool.query('INSERT INTO communities(name,description) VALUES($1,$2) RETURNING *',[name,description])
    res.status(201).json(result.rows[0])
  } catch(e) { res.status(500).json({error:'Could not create community'}) }
})

app.post('/api/users', async (req,res) => {
  const displayName = (req.body.display_name || '').trim()
  if (displayName.length < 2 || displayName.length > 40) return res.status(400).json({error:'Display name must be 2–40 characters'})
  try {
    const result = await pool.query('INSERT INTO users(display_name) VALUES($1) RETURNING *',[displayName])
    res.status(201).json(result.rows[0])
  } catch(e) { res.status(500).json({error:'Could not create user'}) }
})

app.patch('/api/users/:id/avatar', async (req,res) => {
  const { display_name, avatar_emoji, skin } = req.body
  const allowedSkins = ['violet','blue','mint','rose','gold']
  if (skin && !allowedSkins.includes(skin)) return res.status(400).json({error:'Invalid skin'})
  try {
    const result = await pool.query(
      `UPDATE users SET display_name=COALESCE($1,display_name),
       avatar_emoji=COALESCE($2,avatar_emoji),skin=COALESCE($3,skin)
       WHERE id=$4 RETURNING *`,
      [display_name || null,avatar_emoji || null,skin || null,req.params.id])
    if (!result.rowCount) return res.status(404).json({error:'User not found'})
    res.json(result.rows[0])
  } catch(e) { res.status(500).json({error:'Could not update profile'}) }
})

app.listen(port, () => console.log(`MovieVerse API listening on ${port}`))
