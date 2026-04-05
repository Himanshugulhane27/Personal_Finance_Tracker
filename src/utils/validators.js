/**
 * Custom validation helper functions.
 * Supplements Joi schemas with reusable checks.
 */

/**
 * Check if a string is a valid UUID v4.
 */
const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Check if amount is a valid positive number with max 2 decimals.
 */
const isValidAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  if (amount <= 0) return false;
  const decimals = (amount.toString().split('.')[1] || '').length;
  return decimals <= 2;
};

/**
 * Sanitize a search query string.
 */
const sanitizeSearch = (query) => {
  if (!query) return '';
  return query.trim().replace(/[<>]/g, '').slice(0, 100);
};

module.exports = { isUUID, isValidAmount, sanitizeSearch };
