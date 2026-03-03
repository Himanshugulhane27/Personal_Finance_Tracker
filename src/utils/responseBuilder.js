/**
 * Standardized API response builder.
 * Ensures consistent response format across all endpoints.
 */
const success = (data, meta = {}) => ({
  success: true,
  data,
  ...meta,
});

const error = (code, message, details = null) => ({
  success: false,
  error: {
    code,
    message,
    ...(details && { details }),
  },
});

const paginated = (data, pagination) => ({
  success: true,
  data,
  pagination,
});

module.exports = { success, error, paginated };
