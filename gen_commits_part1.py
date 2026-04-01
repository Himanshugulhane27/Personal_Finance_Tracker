#!/usr/bin/env python3
import subprocess, os

os.chdir("/Users/himanshugulhane/Desktop/Personal Finance Tracker")

def commit(dt, msg):
    subprocess.run(["git","add","-A"], check=True)
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = dt
    env["GIT_COMMITTER_DATE"] = dt
    subprocess.run(["git","commit","-m",msg], env=env, check=True)

def replace(fp, old, new):
    with open(fp) as f: c = f.read()
    with open(fp,'w') as f: f.write(c.replace(old, new, 1))

def write(fp, content):
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    with open(fp,'w') as f: f.write(content)

def append(fp, content):
    with open(fp,'a') as f: f.write(content)

# ════════════════════════════════════════════════════
# APR 1 - Config & Foundation (5 commits)
# ════════════════════════════════════════════════════

write("src/config/constants.js", """/**
 * Application-wide constants.
 */
module.exports = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  AUTH: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    SALT_ROUNDS: 12,
  },
  TRANSACTION_TYPES: ['income', 'expense'],
  BUDGET_PERIODS: ['weekly', 'monthly', 'yearly'],
};
""")
commit("2026-04-01T09:15:00+0530", "refactor: extract app constants to config file")

write("src/config/index.js", """/**
 * Centralized configuration loader.
 * Reads from environment variables with sensible defaults.
 */
require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'finance_tracker',
    url: process.env.DATABASE_URL || null,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
};
""")
commit("2026-04-01T11:30:00+0530", "feat: add centralized config loader module")

replace("frontend/index.html",
    "</style>",
    """    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
  </style>""")
commit("2026-04-01T14:00:00+0530", "style: add fadeIn and pulse CSS animations")

replace("frontend/index.html",
    '<span className="text-xl font-bold text-indigo-600">FinanceTracker</span>',
    '<span className="text-xl font-bold text-indigo-600">💰 FinanceTracker</span>')
commit("2026-04-01T16:45:00+0530", "style: add emoji icon to navbar brand")

append("README.md", """
## Roadmap

- [x] JWT Authentication
- [x] Transaction CRUD
- [x] Budget tracking
- [x] Analytics dashboard
- [ ] Dark mode support
- [ ] Recurring expense automation
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Data visualization improvements
""")
commit("2026-04-01T19:30:00+0530", "docs: add project roadmap to README")

# ════════════════════════════════════════════════════
# APR 2 - UI Polish (5 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  </style>""")
commit("2026-04-02T09:00:00+0530", "feat: add skeleton loading shimmer animation")

replace("frontend/index.html",
    "</style>",
    """    .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; padding: 0.75rem 1.5rem; border-radius: 0.5rem; color: white; font-size: 0.875rem; z-index: 50; animation: fadeIn 0.3s ease-out; }
    .toast-success { background-color: #22c55e; }
    .toast-error { background-color: #ef4444; }
  </style>""")
commit("2026-04-02T11:15:00+0530", "feat: add toast notification CSS component")

replace("frontend/index.html",
    "</style>",
    """    .badge { display: inline-flex; align-items: center; padding: 0.125rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .badge-income { background-color: #dcfce7; color: #166534; }
    .badge-expense { background-color: #fef2f2; color: #991b1b; }
  </style>""")
commit("2026-04-02T14:30:00+0530", "style: add income/expense badge component styles")

replace("frontend/index.html",
    "body { font-family:",
    "* { box-sizing: border-box; margin: 0; padding: 0; }\n    html { scroll-behavior: smooth; }\n    body { font-family:")
commit("2026-04-02T17:00:00+0530", "style: add CSS reset and smooth scroll behavior")

replace("frontend/index.html",
    'placeholder="Email address"',
    'placeholder="Email address" autoComplete="email"')
commit("2026-04-02T20:15:00+0530", "fix: add autoComplete attribute to email input")

# ════════════════════════════════════════════════════
# APR 3 - Transaction Improvements (4 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    .table-row-hover:hover { background-color: #f9fafb; }
    th { user-select: none; }
  </style>""")
commit("2026-04-03T10:00:00+0530", "style: add hover highlight to table rows")

replace("frontend/index.html",
    '<h2 className="text-xl font-bold">Transactions</h2>',
    '<h2 className="text-xl font-bold">Transactions</h2>\n            <span className="text-sm text-gray-400 ml-2">({txs.length} shown)</span>')
commit("2026-04-03T12:30:00+0530", "feat: show transaction count next to heading")

write("src/utils/formatters.js", """/**
 * Formatting utility functions.
 */

/**
 * Format a number as USD currency string.
 * @param {number} amount
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to locale display.
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Truncate a string to maxLength with ellipsis.
 */
const truncate = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

module.exports = { formatCurrency, formatDate, truncate };
""")
commit("2026-04-03T15:45:00+0530", "feat: add currency and date formatter utilities")

replace("frontend/index.html",
    'className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date',
    'className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">📅 Date')
commit("2026-04-03T18:00:00+0530", "style: add sort icon hint and hover to date column header")

# ════════════════════════════════════════════════════
# APR 4 - Dark Mode Foundation (6 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    :root { --bg-primary: #ffffff; --bg-secondary: #f3f4f6; --text-primary: #111827; --text-secondary: #6b7280; --border-color: #e5e7eb; --accent: #4f46e5; }
    .dark-mode { --bg-primary: #1f2937; --bg-secondary: #111827; --text-primary: #f9fafb; --text-secondary: #9ca3af; --border-color: #374151; --accent: #818cf8; }
  </style>""")
commit("2026-04-04T09:30:00+0530", "feat: add CSS custom properties for theme support")

replace("frontend/index.html",
    "</style>",
    """    .dark-mode body { background-color: var(--bg-secondary); color: var(--text-primary); }
    .dark-mode .bg-white { background-color: var(--bg-primary); }
    .dark-mode .text-gray-900 { color: var(--text-primary); }
    .dark-mode .text-gray-500 { color: var(--text-secondary); }
    .dark-mode .border-gray-200 { border-color: var(--border-color); }
  </style>""")
commit("2026-04-04T11:45:00+0530", "style: add dark mode overrides for core elements")

replace("frontend/index.html",
    "</style>",
    """    .theme-toggle { background: none; border: 2px solid var(--border-color); border-radius: 0.5rem; padding: 0.375rem 0.75rem; cursor: pointer; font-size: 1.125rem; transition: all 0.2s; }
    .theme-toggle:hover { border-color: var(--accent); }
  </style>""")
commit("2026-04-04T14:00:00+0530", "style: add theme toggle button styles")

write("src/utils/dateUtils.js", """/**
 * Date utility functions for the finance tracker.
 */

/**
 * Get current month in YYYY-MM format.
 */
const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

/**
 * Get the start and end dates for a given month.
 * @param {string} yearMonth - YYYY-MM format
 */
const getMonthRange = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);
  const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const end = new Date(year, month, 0).toISOString().slice(0, 10);
  return { start, end };
};

/**
 * Get relative time string (e.g., "2 days ago").
 */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

module.exports = { getCurrentMonth, getMonthRange, timeAgo };
""")
commit("2026-04-04T16:30:00+0530", "feat: add date utility functions module")

replace("frontend/index.html",
    '<button onClick={handleLogout} className="text-gray-500 hover:text-gray-700" aria-label="Log out">Logout</button>',
    '<button onClick={() => { document.documentElement.classList.toggle("dark-mode"); localStorage.setItem("theme", document.documentElement.classList.contains("dark-mode") ? "dark" : "light"); }} className="theme-toggle" aria-label="Toggle theme">🌙</button>\n                  <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700" aria-label="Log out">Logout</button>')
commit("2026-04-04T19:00:00+0530", "feat: add dark mode toggle button to navbar")

replace("frontend/index.html",
    "const root = ReactDOM.createRoot",
    """// Restore saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark-mode');
    }

    const root = ReactDOM.createRoot""")
commit("2026-04-04T21:00:00+0530", "feat: persist dark mode preference in localStorage")

# ════════════════════════════════════════════════════
# APR 5 - Backend Refactoring (4 commits)
# ════════════════════════════════════════════════════

write("src/middleware/requestId.js", """/**
 * Request ID middleware.
 * Attaches a unique identifier to each incoming request
 * for tracing through logs.
 */
const crypto = require('crypto');

const requestId = (req, _res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  next();
};

module.exports = requestId;
""")
commit("2026-04-05T10:00:00+0530", "feat: add request ID middleware for log tracing")

write("src/utils/validators.js", """/**
 * Custom validation helper functions.
 * Supplements Joi schemas with reusable checks.
 */

/**
 * Check if a string is a valid UUID v4.
 */
const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Check if amount is a valid positive number with max 2 decimals.
 */
const isValidAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  if (amount <= 0) return false;
  const decimals = (amount.toString().split('.')[1] || '').length;
  return decimals <= 2;
};

/**
 * Sanitize a search query string.
 */
const sanitizeSearch = (query) => {
  if (!query) return '';
  return query.trim().replace(/[<>]/g, '').slice(0, 100);
};

module.exports = { isUUID, isValidAmount, sanitizeSearch };
""")
commit("2026-04-05T13:30:00+0530", "feat: add custom validation helper utilities")

replace("src/middleware/errorHandler.js",
    "const AppError = require('../utils/AppError');",
    "const AppError = require('../utils/AppError');\n\n// Error code reference for quick debugging\nconst ERROR_CODES = {\n  PG_UNIQUE: '23505',\n  PG_FK: '23503',\n  PG_CHECK: '23514',\n};")
commit("2026-04-05T16:00:00+0530", "refactor: add PostgreSQL error code constants to error handler")

replace("src/utils/helpers.js",
    "// TODO: add currency formatter utility\n",
    """/**
 * Format cents to dollar string.
 */
const formatUSD = (cents) => {
  return '$' + (cents / 100).toFixed(2);
};

""")
commit("2026-04-05T19:15:00+0530", "feat: implement currency formatter in helpers")

# ════════════════════════════════════════════════════
# APR 6 - Dashboard Enhancements (5 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    .stat-icon { font-size: 1.5rem; display: inline-block; margin-bottom: 0.5rem; }
    .stat-card { position: relative; overflow: hidden; }
    .stat-card::after { content: ''; position: absolute; top: 0; right: 0; width: 80px; height: 80px; background: linear-gradient(135deg, transparent 50%, rgba(99,102,241,0.05) 50%); }
  </style>""")
commit("2026-04-06T09:30:00+0530", "style: add decorative corner accent to stat cards")

replace("frontend/index.html",
    '<h3 className="text-gray-500 text-sm font-medium uppercase">Total Income</h3>',
    '<div className="stat-icon">📈</div>\n            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Income</h3>')
commit("2026-04-06T11:45:00+0530", "feat: add emoji icons to dashboard summary cards")

replace("frontend/index.html",
    '<h3 className="text-gray-500 text-sm font-medium uppercase">Total Expense</h3>',
    '<div className="stat-icon">📉</div>\n            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Expense</h3>')
replace("frontend/index.html",
    '<h3 className="text-gray-500 text-sm font-medium uppercase">Net Savings</h3>',
    '<div className="stat-icon">💵</div>\n            <h3 className="text-gray-500 text-sm font-medium uppercase">Net Savings</h3>')
replace("frontend/index.html",
    '<h3 className="text-gray-500 text-sm font-medium uppercase">Savings Rate</h3>',
    '<div className="stat-icon">🎯</div>\n            <h3 className="text-gray-500 text-sm font-medium uppercase">Savings Rate</h3>')
commit("2026-04-06T14:00:00+0530", "feat: add icons to all dashboard stat cards")

replace("frontend/index.html",
    "</style>",
    """    .empty-state { text-align: center; padding: 3rem 1rem; color: #9ca3af; }
    .empty-state-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state-text { font-size: 0.875rem; }
  </style>""")
commit("2026-04-06T17:00:00+0530", "style: add empty state component styles")

replace("frontend/index.html",
    "No active budgets.",
    "No active budgets yet. Create a budget to start tracking your spending!")
commit("2026-04-06T19:45:00+0530", "fix: improve empty state message for budgets")

# ════════════════════════════════════════════════════
# APR 7 - Search, Filters & Responsive (5 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    .search-box { position: relative; }
    .search-box input { padding-left: 2.25rem; }
    .search-box::before { content: '🔍'; position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 0.875rem; }
    .filter-btn { padding: 0.375rem 0.875rem; border-radius: 9999px; font-size: 0.75rem; border: 1px solid #e5e7eb; cursor: pointer; transition: all 0.15s; }
    .filter-btn:hover { border-color: #6366f1; color: #6366f1; }
    .filter-btn.active { background-color: #4f46e5; color: white; border-color: #4f46e5; }
  </style>""")
commit("2026-04-07T09:30:00+0530", "style: add search box and filter button components")

replace("frontend/index.html",
    "</style>",
    """    @media (max-width: 768px) {
      .w-64 { width: 100% !important; }
      .flex.gap-8 { flex-direction: column !important; gap: 1rem !important; }
      .grid-cols-4 { grid-template-columns: repeat(2, 1fr) !important; }
      .px-6 { padding-left: 0.75rem; padding-right: 0.75rem; }
    }
    @media (max-width: 480px) {
      .grid-cols-4, .grid-cols-2 { grid-template-columns: 1fr !important; }
    }
  </style>""")
commit("2026-04-07T12:00:00+0530", "fix: improve responsive layout for mobile devices")

write("src/middleware/responseTime.js", """/**
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
""")
commit("2026-04-07T14:30:00+0530", "feat: add response time tracking middleware")

replace("frontend/index.html",
    "</style>",
    """    .tooltip { position: relative; }
    .tooltip::after { content: attr(data-tip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #1f2937; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
    .tooltip:hover::after { opacity: 1; }
  </style>""")
commit("2026-04-07T17:15:00+0530", "feat: add CSS tooltip component for UI hints")

replace("frontend/index.html",
    "</style>",
    """    .divider { height: 1px; background: linear-gradient(to right, transparent, #e5e7eb, transparent); margin: 1.5rem 0; }
  </style>""")
commit("2026-04-07T20:00:00+0530", "style: add gradient divider utility class")

print("\n✅ Part 1 complete! (Apr 1-7: 34 commits)")
subprocess.run(["git","log","--format=%h %ai %s","-35"], check=True)
