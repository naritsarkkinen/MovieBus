const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const generateToken = require('../utils/generateToken');

async function signup(req, res, next) {
  try {
    const displayName = String(req.body.display_name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (displayName.length < 2 || displayName.length > 40) {
      return res.status(400).json({ error: 'Display name must be 2–40 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: 'Password must be 8–72 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (display_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, display_name, email, avatar_emoji, skin, created_at`,
      [displayName, email, passwordHash]
    );

    const user = result.rows[0];
    res.status(201).json({
      message: 'Account created successfully.',
      token: generateToken(user),
      user
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query(
      `SELECT id, display_name, email, password_hash, avatar_emoji, skin, created_at
       FROM users WHERE LOWER(email) = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    delete user.password_hash;
    res.json({
      message: 'Login successful.',
      token: generateToken(user),
      user
    });
  } catch (error) {
    next(error);
  }
}

function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { signup, login, getMe };
