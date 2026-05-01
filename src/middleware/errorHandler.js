/**
 * Centralized error-handler middleware.
 *
 * Must be registered AFTER all routes.  Catches any error (thrown or
 * passed via next(err)) and returns the canonical JSON envelope:
 *
 *   { success: false, error: { code: "…", message: "…" } }
 */
const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  // ── Operational (expected) errors ─────────────────────
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // ── Joi / validation library errors ───────────────────
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.details
          ? err.details.map((d) => d.message).join('; ')
          : err.message,
      },
    });
  }

  // ── PostgreSQL unique-violation (23505) ───────────────
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A resource with the given data already exists.',
      },
    });
  }

  // ── PostgreSQL foreign-key violation (23503) ──────────
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Referenced resource does not exist.',
      },
    });
  }

  // ── JWT errors ────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: err.name === 'TokenExpiredError'
          ? 'Token has expired'
          : 'Invalid token',
      },
    });
  }

  // ── Unknown / programmer errors ───────────────────────
  console.error('[UNHANDLED ERROR]', err);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
};

module.exports = errorHandler;
