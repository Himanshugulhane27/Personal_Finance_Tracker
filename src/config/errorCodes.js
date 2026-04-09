/**
 * Centralized error code definitions.
 * Maps internal error codes to HTTP status codes and messages.
 */
const ERROR_CODES = {
  VALIDATION_ERROR: { status: 422, message: 'Validation failed' },
  UNAUTHORIZED: { status: 401, message: 'Authentication required' },
  FORBIDDEN: { status: 403, message: 'Access denied' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  CONFLICT: { status: 409, message: 'Resource already exists' },
  RATE_LIMITED: { status: 429, message: 'Too many requests' },
  INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
};

module.exports = ERROR_CODES;
