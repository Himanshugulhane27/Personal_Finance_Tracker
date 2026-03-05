/**
 * Rate limiting configs.
 */
const rateLimit = require('express-rate-limit');
const createLimiter = (windowMs, max, msg) => rateLimit({ windowMs, max, message: { success: false, error: { code: 'RATE_LIMIT', message: msg } }, standardHeaders: true, legacyHeaders: false });
const authLimiter = createLimiter(60000, 10, 'Too many auth attempts.');
const apiLimiter = createLimiter(900000, 100, 'Too many requests.');
const exportLimiter = createLimiter(60000, 5, 'Export rate limited.');
module.exports = { authLimiter, apiLimiter, exportLimiter };
