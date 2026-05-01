/**
 * JWT authentication middleware.
 *
 * Reads the access token from the Authorization header (Bearer <token>),
 * verifies it, and attaches `req.user = { id, email }` for downstream use.
 */
const jwt      = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or malformed Authorization header');
    }

    const token   = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach user context for all downstream handlers
    req.user = {
      id:    payload.sub,
      email: payload.email,
    };

    next();
  } catch (err) {
    if (err.isOperational) return next(err);

    // jwt.verify throws JsonWebTokenError / TokenExpiredError
    if (err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Access token has expired'));
    }
    return next(AppError.unauthorized('Invalid access token'));
  }
};

module.exports = authenticate;
