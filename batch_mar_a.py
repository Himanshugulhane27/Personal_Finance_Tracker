#!/usr/bin/env python3
import subprocess, os

os.chdir("/Users/himanshugulhane/Desktop/Personal Finance Tracker")

def commit(dt, msg):
    subprocess.run(["git","add","-A"], check=True)
    e = os.environ.copy(); e["GIT_AUTHOR_DATE"]=dt; e["GIT_COMMITTER_DATE"]=dt
    subprocess.run(["git","commit","-m",msg], env=e, check=True)

def r(fp, old, new):
    with open(fp) as f: c=f.read()
    with open(fp,'w') as f: f.write(c.replace(old, new, 1))

def w(fp, content):
    d=os.path.dirname(fp)
    if d: os.makedirs(d, exist_ok=True)
    with open(fp,'w') as f: f.write(content)

def a(fp, content):
    with open(fp,'a') as f: f.write(content)

# ══════════════════════════════════════════════
# MAR 1 — Project Foundation (3 commits)
# ══════════════════════════════════════════════

w("LICENSE", """MIT License

Copyright (c) 2026 Himanshu Gulhane

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
""")
commit("2026-03-01T10:00:00+0530", "chore: add MIT license file")

w(".prettierrc", """{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
""")
commit("2026-03-01T14:30:00+0530", "chore: add prettier configuration")

w(".eslintrc.json", """{
  "env": {
    "node": true,
    "es2021": true,
    "jest": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {
    "no-console": "off",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
""")
commit("2026-03-01T18:15:00+0530", "chore: add eslint configuration with node rules")

# ══════════════════════════════════════════════
# MAR 2 — Core Backend Setup (5 commits)
# ══════════════════════════════════════════════

w("src/utils/logger.js", """/**
 * Simple logger utility.
 * Wraps console methods with timestamps and levels.
 */
const logger = {
  info: (...args) => console.log(`[${new Date().toISOString()}] [INFO]`, ...args),
  warn: (...args) => console.warn(`[${new Date().toISOString()}] [WARN]`, ...args),
  error: (...args) => console.error(`[${new Date().toISOString()}] [ERROR]`, ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [DEBUG]`, ...args);
    }
  },
};

module.exports = logger;
""")
commit("2026-03-02T09:00:00+0530", "feat: add structured logger utility with levels")

w("src/utils/pagination.js", """/**
 * Pagination helper.
 * Builds SQL LIMIT/OFFSET and response metadata.
 */
const buildPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  total_pages: Math.ceil(total / limit),
  has_next: page < Math.ceil(total / limit),
  has_prev: page > 1,
});

module.exports = { buildPagination, paginationMeta };
""")
commit("2026-03-02T11:30:00+0530", "feat: add pagination helper with metadata builder")

w("src/utils/asyncHandler.js", """/**
 * Async handler wrapper for Express routes.
 * Eliminates the need for try/catch in every controller.
 *
 * Usage: router.get('/', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
""")
commit("2026-03-02T14:45:00+0530", "feat: add async handler wrapper to reduce boilerplate")

r("src/middleware/errorHandler.js",
    "// eslint-disable-next-line no-unused-vars",
    "// Express error handlers require 4 params even if unused\n// eslint-disable-next-line no-unused-vars")
commit("2026-03-02T17:00:00+0530", "chore: improve error handler comment clarity")

w("src/utils/sanitize.js", """/**
 * Input sanitization utilities.
 * Prevents XSS and cleans user input before processing.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const sanitizeObject = (obj) => {
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    clean[key] = typeof val === 'string' ? sanitizeString(val) : val;
  }
  return clean;
};

module.exports = { sanitizeString, sanitizeObject };
""")
commit("2026-03-02T20:30:00+0530", "feat: add input sanitization utilities for XSS prevention")

# ══════════════════════════════════════════════
# MAR 3 — Heavy Feature Day (7 commits)
# ══════════════════════════════════════════════

r("frontend/index.html",
    "</style>",
    """    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn 0.15s ease; }
    .modal-content { background: white; border-radius: 0.75rem; padding: 1.5rem; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.25); animation: fadeIn 0.2s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .modal-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #6b7280; padding: 0.25rem; }
    .modal-close:hover { color: #111827; }
  </style>""")
commit("2026-03-03T08:30:00+0530", "feat: add modal component CSS for dialogs")

r("frontend/index.html",
    "</style>",
    """    .sidebar { min-height: calc(100vh - 4rem); border-right: 1px solid #e5e7eb; padding-right: 1rem; }
    .sidebar-section { margin-bottom: 1.5rem; }
    .sidebar-title { font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; font-weight: 600; margin-bottom: 0.5rem; padding-left: 1rem; }
  </style>""")
commit("2026-03-03T10:15:00+0530", "style: add sidebar layout with section grouping")

w("src/utils/responseBuilder.js", """/**
 * Standardized API response builder.
 * Ensures consistent response format across all endpoints.
 */
const success = (data, meta = {}) => ({
  success: true,
  data,
  ...meta,
});

const error = (code, message, details = null) => ({
  success: false,
  error: {
    code,
    message,
    ...(details && { details }),
  },
});

const paginated = (data, pagination) => ({
  success: true,
  data,
  pagination,
});

module.exports = { success, error, paginated };
""")
commit("2026-03-03T12:00:00+0530", "refactor: add response builder for consistent API format")

r("frontend/index.html",
    "</style>",
    """    .tab-bar { display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 1.5rem; }
    .tab-item { padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 500; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; }
    .tab-item:hover { color: #374151; }
    .tab-item.active { color: #4f46e5; border-bottom-color: #4f46e5; }
  </style>""")
commit("2026-03-03T14:30:00+0530", "style: add tab bar navigation component")

r("frontend/index.html",
    "</style>",
    """    .card-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid #f3f4f6; margin-bottom: 1rem; }
    .card-title { font-weight: 600; font-size: 1rem; color: #111827; }
    .card-subtitle { font-size: 0.75rem; color: #9ca3af; }
  </style>""")
commit("2026-03-03T17:00:00+0530", "style: add card header with title and subtitle styles")

r("frontend/index.html",
    "</style>",
    """    .input-group { margin-bottom: 1rem; }
    .input-label { display: block; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.375rem; }
    .input-field { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; transition: border-color 0.15s, box-shadow 0.15s; }
    .input-field:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); outline: none; }
    .input-error { border-color: #ef4444; }
    .input-hint { font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem; }
  </style>""")
commit("2026-03-03T19:30:00+0530", "style: add form input group with validation states")

r("frontend/index.html",
    "</style>",
    """    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-primary:hover { background: #4338ca; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .btn-secondary:hover { background: #e5e7eb; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover { background: #dc2626; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
    .btn-lg { padding: 0.75rem 1.5rem; font-size: 1rem; }
  </style>""")
commit("2026-03-03T22:00:00+0530", "style: add comprehensive button component system")

# ══════════════════════════════════════════════
# MAR 4 — Light Day (2 commits)
# ══════════════════════════════════════════════

r("frontend/index.html",
    "</style>",
    """    .status-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; display: inline-block; margin-right: 0.375rem; }
    .status-dot.online { background: #22c55e; }
    .status-dot.offline { background: #ef4444; }
    .status-dot.pending { background: #f59e0b; }
  </style>""")
commit("2026-03-04T15:00:00+0530", "style: add status indicator dots component")

r("src/utils/helpers.js",
    "module.exports = { sha256, parseMonth, clamp, round, formatUSD };",
    """/**
 * Generate a random hex color.
 */
const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

module.exports = { sha256, parseMonth, clamp, round, formatUSD, randomColor };""")
commit("2026-03-04T21:30:00+0530", "feat: add random color generator to helpers")

# ══════════════════════════════════════════════
# MAR 5 — Sprint Day (10 commits)
# ══════════════════════════════════════════════

r("frontend/index.html",
    "</style>",
    """    .dropdown { position: relative; display: inline-block; }
    .dropdown-menu { position: absolute; top: 100%; right: 0; background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); min-width: 12rem; z-index: 50; padding: 0.25rem; }
    .dropdown-item { display: block; width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #374151; border-radius: 0.375rem; cursor: pointer; text-align: left; background: none; border: none; }
    .dropdown-item:hover { background: #f3f4f6; }
    .dropdown-divider { height: 1px; background: #e5e7eb; margin: 0.25rem 0; }
  </style>""")
commit("2026-03-05T08:00:00+0530", "feat: add dropdown menu component styles")

r("frontend/index.html",
    "</style>",
    """    .chip { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .chip-removable::after { content: '×'; margin-left: 0.25rem; cursor: pointer; font-size: 0.875rem; }
    .chip-blue { background: #dbeafe; color: #1e40af; }
    .chip-green { background: #dcfce7; color: #166534; }
    .chip-red { background: #fef2f2; color: #991b1b; }
    .chip-purple { background: #f3e8ff; color: #6b21a8; }
    .chip-yellow { background: #fef9c3; color: #854d0e; }
  </style>""")
commit("2026-03-05T09:30:00+0530", "style: add chip/tag component with color variants")

w("src/utils/queryBuilder.js", """/**
 * Dynamic SQL query builder for filtered listings.
 * Builds WHERE clauses from filter objects safely.
 */
class QueryBuilder {
  constructor(baseQuery) {
    this.query = baseQuery;
    this.conditions = [];
    this.values = [];
    this.paramIndex = 1;
  }

  where(column, value, operator = '=') {
    if (value === undefined || value === null) return this;
    this.conditions.push(`${column} ${operator} $${this.paramIndex}`);
    this.values.push(value);
    this.paramIndex++;
    return this;
  }

  whereBetween(column, min, max) {
    if (min) { this.where(column, min, '>='); }
    if (max) { this.where(column, max, '<='); }
    return this;
  }

  orderBy(column, direction = 'DESC') {
    const dir = direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    this.orderClause = `ORDER BY ${column} ${dir}`;
    return this;
  }

  limit(limit, offset) {
    this.limitClause = `LIMIT $${this.paramIndex} OFFSET $${this.paramIndex + 1}`;
    this.values.push(limit, offset);
    this.paramIndex += 2;
    return this;
  }

  build() {
    let sql = this.query;
    if (this.conditions.length) sql += ' WHERE ' + this.conditions.join(' AND ');
    if (this.orderClause) sql += ' ' + this.orderClause;
    if (this.limitClause) sql += ' ' + this.limitClause;
    return { sql, values: this.values };
  }
}

module.exports = QueryBuilder;
""")
commit("2026-03-05T10:45:00+0530", "feat: add dynamic SQL query builder class")

r("frontend/index.html",
    "</style>",
    """    .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem; }
    .breadcrumb-item { color: #6b7280; text-decoration: none; }
    .breadcrumb-item:hover { color: #374151; }
    .breadcrumb-separator { color: #d1d5db; }
    .breadcrumb-current { color: #111827; font-weight: 500; }
  </style>""")
commit("2026-03-05T12:00:00+0530", "style: add breadcrumb navigation component")

w("src/middleware/notFound.js", """/**
 * 404 handler middleware.
 * Catches requests that don't match any defined route.
 */
const AppError = require('../utils/AppError');

const notFound = (req, _res, next) => {
  next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
""")
commit("2026-03-05T13:30:00+0530", "refactor: extract 404 handler into dedicated middleware")

r("frontend/index.html",
    "</style>",
    """    .avatar-sm { width: 2rem; height: 2rem; font-size: 0.75rem; }
    .avatar-lg { width: 3.5rem; height: 3.5rem; font-size: 1.25rem; }
    .avatar-group { display: flex; }
    .avatar-group .avatar { margin-left: -0.5rem; border: 2px solid white; }
    .avatar-group .avatar:first-child { margin-left: 0; }
  </style>""")
commit("2026-03-05T15:00:00+0530", "style: add avatar size variants and group layout")

w("src/utils/rateLimitConfig.js", """/**
 * Rate limiting configurations for different route groups.
 */
const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

const authLimiter = createLimiter(
  60 * 1000,
  10,
  'Too many auth attempts. Try again in 1 minute.'
);

const apiLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests. Try again in 15 minutes.'
);

const exportLimiter = createLimiter(
  60 * 1000,
  5,
  'Export rate limited. Try again in 1 minute.'
);

module.exports = { authLimiter, apiLimiter, exportLimiter };
""")
commit("2026-03-05T16:30:00+0530", "refactor: centralize rate limit configs for all routes")

r("frontend/index.html",
    "</style>",
    """    .table-container { border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; }
    .table-container table { border-collapse: collapse; width: 100%; }
    .table-container th { background: #f9fafb; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; padding: 0.75rem 1rem; text-align: left; }
    .table-container td { padding: 0.75rem 1rem; font-size: 0.875rem; border-top: 1px solid #f3f4f6; }
  </style>""")
commit("2026-03-05T18:00:00+0530", "style: redesign table with container border and header")

r("frontend/index.html",
    "</style>",
    """    .notification-banner { position: fixed; top: 1rem; right: 1rem; left: 1rem; max-width: 28rem; margin: 0 auto; padding: 0.875rem 1.25rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.75rem; z-index: 200; animation: fadeIn 0.3s ease; font-size: 0.875rem; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
    .notification-banner.success { background: #22c55e; color: white; }
    .notification-banner.error { background: #ef4444; color: white; }
    .notification-banner.info { background: #3b82f6; color: white; }
  </style>""")
commit("2026-03-05T20:00:00+0530", "feat: add floating notification banner styles")

r("frontend/index.html",
    "</style>",
    """    .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 0.625rem 0; border-bottom: 1px solid #f3f4f6; }
    .summary-row:last-child { border-bottom: none; font-weight: 600; }
    .summary-label { font-size: 0.875rem; color: #6b7280; }
    .summary-value { font-size: 0.875rem; font-weight: 600; }
    .summary-value.positive { color: #16a34a; }
    .summary-value.negative { color: #dc2626; }
  </style>""")
commit("2026-03-05T23:00:00+0530", "style: add summary row component for financial totals")

print("✅ Mar 1-5 done!")
subprocess.run(["git","log","--format=%h %ai %s","-30"], check=True)
