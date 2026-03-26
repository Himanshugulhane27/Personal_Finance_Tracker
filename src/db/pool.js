// Database connection pool configuration
/**
 * PostgreSQL connection pool with query helpers.
 *
 * Exposes:
 *   pool     — raw pg.Pool (for advanced use)
 *   query()  — fire-and-forget parameterized query
 *   withTransaction(cb) — execute `cb(client)` inside a BEGIN/COMMIT block
 */
const { Pool } = require('pg');

const poolConfig = {
  max: 20,                // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  // Make sure SSL is enabled when connecting via connection string (like Neon)
  poolConfig.ssl = { rejectUnauthorized: false };
} else {
  poolConfig.host     = process.env.DB_HOST     || 'localhost';
  poolConfig.port     = Number(process.env.DB_PORT) || 5432;
  poolConfig.database = process.env.DB_NAME     || 'finance_tracker';
  poolConfig.user     = process.env.DB_USER     || 'postgres';
  poolConfig.password = process.env.DB_PASSWORD || '';
}

const pool = new Pool(poolConfig);

// Log pool errors (but don't crash)
pool.on('error', (err) => {
  console.error('[PG POOL] Unexpected error on idle client', err);
});

/**
 * Execute a parameterized query against the pool.
 * @param {string} text  — SQL with $1, $2 … placeholders
 * @param {any[]}  params
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Run `callback(client)` inside a transaction.
 * Automatically calls BEGIN, COMMIT, and ROLLBACK on error.
 *
 * @param {(client: import('pg').PoolClient) => Promise<any>} callback
 * @returns {Promise<any>} — whatever the callback returns
 */
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, withTransaction };
