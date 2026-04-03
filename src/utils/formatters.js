/**
 * Formatting utility functions.
 */

/**
 * Format a number as USD currency string.
 * @param {number} amount
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to locale display.
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Truncate a string to maxLength with ellipsis.
 */
const truncate = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

module.exports = { formatCurrency, formatDate, truncate };
