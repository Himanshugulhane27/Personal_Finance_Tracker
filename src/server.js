/**
 * Server entry point — starts the Express app and cron scheduler.
 */
require('dotenv').config();

const app  = require('./app');
const { startCronJobs } = require('./utils/cronJobs');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Personal Finance Tracker API`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port        : ${PORT}`);
  console.log(`   Database    : ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log('');

  // Start cron jobs only in production / development (not test)
  if (process.env.NODE_ENV !== 'test') {
    startCronJobs();
  }
});
