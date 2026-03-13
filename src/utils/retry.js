/**
 * Retry utility for unreliable operations.
 */
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const retry = async (fn, { maxRetries = 3, delay = 1000, backoff = 2 } = {}) => {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try { return await fn(); }
    catch (err) { lastError = err; if (i < maxRetries) await wait(delay * Math.pow(backoff, i)); }
  }
  throw lastError;
};
module.exports = { retry, wait };
