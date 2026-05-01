/**
 * AppError — Centralized application error class.
 *
 * Every error thrown through the app should use this class (or one of its
 * factory helpers) so that the error-handler middleware can emit a consistent
 * JSON envelope:  { success: false, error: { code, message } }
 */
class AppError extends Error {
  /**
   * @param {string} message  — human-readable error description
   * @param {number} statusCode — HTTP status code
   * @param {string} code — machine-readable error code (e.g. "VALIDATION_ERROR")
   */
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // distinguishes from programmer bugs
    Error.captureStackTrace(this, this.constructor);
  }

  /* ─── Factory helpers ─────────────────────────────────── */

  static badRequest(message = 'Bad request') {
    return new AppError(message, 400, 'BAD_REQUEST');
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message = 'Resource already exists') {
    return new AppError(message, 409, 'CONFLICT');
  }

  static validation(message = 'Validation failed') {
    return new AppError(message, 422, 'VALIDATION_ERROR');
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }
}

module.exports = AppError;
