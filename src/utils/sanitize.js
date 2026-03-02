/**
 * Input sanitization utilities.
 * Prevents XSS and cleans user input before processing.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const sanitizeObject = (obj) => {
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    clean[key] = typeof val === 'string' ? sanitizeString(val) : val;
  }
  return clean;
};

module.exports = { sanitizeString, sanitizeObject };
