/**
 * Date utility functions for the finance tracker.
 */

/**
 * Get current month in YYYY-MM format.
 */
const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

/**
 * Get the start and end dates for a given month.
 * @param {string} yearMonth - YYYY-MM format
 */
const getMonthRange = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);
  const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const end = new Date(year, month, 0).toISOString().slice(0, 10);
  return { start, end };
};

/**
 * Get relative time string (e.g., "2 days ago").
 */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

module.exports = { getCurrentMonth, getMonthRange, timeAgo };
