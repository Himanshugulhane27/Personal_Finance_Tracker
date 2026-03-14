/**
 * Commonly used regex patterns.
 */
module.exports = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  YYYY_MM: /^\d{4}-(0[1-9]|1[0-2])$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/,
};
