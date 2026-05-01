/**
 * Server entry point — starts the Express app and cron scheduler.
 */
require('dotenv').config();

const app  = require('./app');
const { startCronJobs } = require('./utils/cronJobs');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Personal Finance Tracker API`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   URL         : http://localhost:${PORT}`);
  console.log(`   Database    : Postgres (Neon/Local Connected)`);
  console.log('');

  // Start cron jobs only in production / development (not test)
  if (process.env.NODE_ENV !== 'test') {
    startCronJobs();
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\nSIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    try {
      const { pool } = require('./db/pool');
      await pool.end();
      console.log('Database pool drained');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database pool', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
