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
const errorHandler = require('./middleware/errorHandler');
const AppError     = require('./utils/AppError');

const app = express();

/* ─── Global middleware ───────────────────────────────── */
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// HTTP request logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/* ─── Health check ────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ─── API routes ──────────────────────────────────────── */
app.use('/auth',         require('./routes/auth.routes'));
app.use('/transactions', require('./routes/transaction.routes'));
app.use('/categories',   require('./routes/category.routes'));
app.use('/budgets',      require('./routes/budget.routes'));
app.use('/analytics',    require('./routes/analytics.routes'));
app.use('/export',       require('./routes/export.routes'));

/* ─── 404 catch-all ───────────────────────────────────── */
app.use((_req, _res, next) => {
  next(AppError.notFound('Route not found'));
});

/* ─── Centralized error handler (must be last) ────────── */
app.use(errorHandler);

module.exports = app;
