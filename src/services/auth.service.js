/**
 * Auth service — registration, login, token refresh.
 */
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const db     = require('../db/pool');
const { sha256 } = require('../utils/helpers');
const AppError   = require('../utils/AppError');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

/* ────────────────────────────────────────────────────────
 * Token generation helpers
 * ──────────────────────────────────────────────────────── */

const generateAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

/**
 * Parse a human-readable duration (e.g. "7d", "30d") into milliseconds.
 */
const parseDuration = (str) => {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const val  = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return val * (multipliers[unit] || 86400000);
};

/**
 * Store a hashed refresh token in the database.
 */
const saveRefreshToken = async (userId, rawToken) => {
  const hash      = sha256(rawToken);
  const expiresMs = parseDuration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
  const expiresAt = new Date(Date.now() + expiresMs);

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, hash, expiresAt]
  );
};

/* ────────────────────────────────────────────────────────
 * Public API
 * ──────────────────────────────────────────────────────── */

/**
 * Register a new user.
 * The PG trigger auto-seeds 12 default categories.
 *
 * @returns {{ user, accessToken, refreshToken }}
 */
const register = async ({ name, email, password }) => {
  // Check if email already taken
  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (existing.rows.length > 0) {
    throw AppError.conflict('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email.toLowerCase(), passwordHash]
  );

  const user         = rows[0];
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await saveRefreshToken(user.id, refreshToken);

  return { user, accessToken, refreshToken };
};

/**
 * Authenticate with email + password.
 *
 * @returns {{ user, accessToken, refreshToken }}
 */
const login = async ({ email, password }) => {
  const { rows } = await db.query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (rows.length === 0) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const user  = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await saveRefreshToken(user.id, refreshToken);

  // Strip password_hash before returning
  delete user.password_hash;

  return { user, accessToken, refreshToken };
};

/**
 * Rotate refresh token: revoke the old one, issue new pair.
 *
 * @param {string} oldRefreshToken — raw refresh token
 * @returns {{ accessToken, refreshToken }}
 */
const refresh = async (oldRefreshToken) => {
  const hash = sha256(oldRefreshToken);

  // Find & validate the stored token
  const { rows } = await db.query(
    `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked,
            u.email
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1`,
    [hash]
  );

  if (rows.length === 0) {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const stored = rows[0];

  if (stored.revoked) {
    // Possible token reuse attack — revoke ALL tokens for this user
    await db.query(
      'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1',
      [stored.user_id]
    );
    throw AppError.unauthorized('Refresh token has been revoked (possible reuse detected)');
  }

  if (new Date(stored.expires_at) < new Date()) {
    throw AppError.unauthorized('Refresh token has expired');
  }

  // Revoke old token (rotation)
  await db.query(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1',
    [stored.id]
  );

  // Issue new pair
  const user = { id: stored.user_id, email: stored.email };
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
};

module.exports = { register, login, refresh };
