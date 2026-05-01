/**
 * Database migration runner.
 * Reads and executes all .sql files in /src/db/migrations in sorted order.
 *
 * Usage:  npm run migrate
 */
require('dotenv').config();

const fs   = require('fs');
const path = require('path');
const { pool } = require('./pool');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate() {
  console.log('🔄 Running migrations…');

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`  ▸ ${file}`);
    await pool.query(sql);
  }

  console.log('✅ All migrations applied.');
  await pool.end();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  pool.end();
  process.exit(1);
});
