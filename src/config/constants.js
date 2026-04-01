/**
 * Application-wide constants.
 */
module.exports = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  AUTH: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    SALT_ROUNDS: 12,
  },
  TRANSACTION_TYPES: ['income', 'expense'],
  BUDGET_PERIODS: ['weekly', 'monthly', 'yearly'],
};
