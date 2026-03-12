/**
 * Security configuration constants.
 */
module.exports = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  TOKEN_BYTES: 32,
  BCRYPT_ROUNDS: 12,
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
  HELMET_OPTIONS: {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  },
};
