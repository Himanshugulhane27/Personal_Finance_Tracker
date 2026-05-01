/**
 * Shared utility helpers.
 */
const crypto = require('crypto');

/**
 * SHA-256 hash a string and return the hex digest.
 * Used for hashing refresh tokens before storage.
 */
const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

/**
 * Parse a YYYY-MM string into { start, end } Date range (UTC).
 * start = first day 00:00:00 UTC, end = first day of next month.
 */
const parseMonth = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end   = new Date(Date.UTC(year, month, 1)); // first of next month
  return { start, end };
};

/**
 * Clamp a number between min and max.
 */
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * Round a number to N decimal places.
 */
const round = (val, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(val * factor) / factor;
};

module.exports = { sha256, parseMonth, clamp, round };
