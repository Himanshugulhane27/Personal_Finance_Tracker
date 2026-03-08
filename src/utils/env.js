/**
 * Environment variable validator.
 * Checks required env vars at startup.
 */
const required = ['JWT_ACCESS_SECRET','JWT_REFRESH_SECRET'];
const validateEnv = () => {
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
};
module.exports = { validateEnv };
