/**
 * Response time header middleware.
 * Adds X-Response-Time header to track API performance.
 */
const responseTime = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    res.setHeader('X-Response-Time', `${ms.toFixed(2)}ms`);
  });

  next();
};

module.exports = responseTime;
