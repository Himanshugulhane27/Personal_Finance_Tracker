/**
 * Error reporting utility.
 * In production, this could send errors to Sentry/Datadog.
 */
const logger = require('./logger');

const reportError = (error, context = {}) => {
  const payload = {
    message: error.message,
    stack: error.stack,
    code: error.code || 'UNKNOWN',
    timestamp: new Date().toISOString(),
    ...context,
  };
  logger.error('Error reported:', payload);
  // TODO: integrate with external error tracking service
};

module.exports = { reportError };
