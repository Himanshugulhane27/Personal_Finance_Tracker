// Personal Finance Tracker - v1.0.0
/**
 * Express application setup.
 *
 * Configures middleware, mounts routers, and registers the
 * centralized error handler. Exported separately from server.js
 * so that integration tests can import the app without starting
 * a listening server.
 */
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const path         = require('path');
const errorHandler = require('./middleware/errorHandler');
const AppError     = require('./utils/AppError');

const app = express();

/* ─── Global middleware ───────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: false, // Disabled so React/Tailwind CDNs can load
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// HTTP request logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/* ─── Health check ────────────────────────────────────── */
app.get('/health', async (_req, res) => {
  try {
    const { pool } = require('./db/pool');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

/* ─── API routes ──────────────────────────────────────── */
app.use('/auth',         require('./routes/auth.routes'));
app.use('/transactions', require('./routes/transaction.routes'));
app.use('/categories',   require('./routes/category.routes'));
app.use('/budgets',      require('./routes/budget.routes'));
app.use('/analytics',    require('./routes/analytics.routes'));
app.use('/export',       require('./routes/export.routes'));

/* ─── Frontend ────────────────────────────────────────── */
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res, next) => {
  // If it's an API route that wasn't found, pass to the 404 handler
  const apiPaths = ['/auth', '/transactions', '/categories', '/budgets', '/analytics', '/export'];
  if (apiPaths.some(apiPath => req.path.startsWith(apiPath))) {
    return next();
  }
  // Otherwise serve the React app
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/* ─── 404 catch-all for API ───────────────────────────── */
app.use((_req, _res, next) => {
  next(AppError.notFound('Route not found'));
});

/* ─── Centralized error handler (must be last) ────────── */
app.use(errorHandler);

module.exports = app;
