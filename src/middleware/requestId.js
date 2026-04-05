/**
 * Request ID middleware.
 * Attaches a unique identifier to each incoming request
 * for tracing through logs.
 */
const crypto = require('crypto');

const requestId = (req, _res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  next();
};

module.exports = requestId;
