/**
 * 404 handler middleware.
 */
const AppError = require('../utils/AppError');
const notFound = (req, _res, next) => {
  next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};
module.exports = notFound;
