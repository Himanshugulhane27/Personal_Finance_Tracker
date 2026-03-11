/**
 * Default application values.
 */
module.exports = {
  CURRENCY: 'USD',
  LOCALE: 'en-US',
  TIMEZONE: 'UTC',
  DATE_FORMAT: 'YYYY-MM-DD',
  DEFAULT_CATEGORIES: {
    income: ['Salary','Freelance','Investments','Other Income'],
    expense: ['Food & Dining','Transportation','Shopping','Entertainment','Bills & Utilities','Healthcare','Education','Other'],
  },
  CHART_MONTHS: 6,
  SESSION_TIMEOUT: 30 * 60 * 1000,
};
