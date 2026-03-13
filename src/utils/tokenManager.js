/**
 * Token management utilities.
 * Handles generation and validation of secure random tokens.
 */
const crypto = require('crypto');
const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
const generateShortCode = (length = 6) => crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
module.exports = { generateToken, generateShortCode };
