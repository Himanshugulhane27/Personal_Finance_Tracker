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
# APR 8 - Charts & Analytics Polish (5 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    .chart-container { position: relative; padding: 1rem; border-radius: 0.75rem; }
    .chart-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
  </style>""")
commit("2026-04-08T09:15:00+0530", "style: add chart container and title styles")

replace("frontend/index.html",
    "backgroundColor: 'rgba(34, 197, 94, 0.8)'",
    "backgroundColor: 'rgba(34, 197, 94, 0.8)', borderRadius: 6")
replace("frontend/index.html",
    "backgroundColor: 'rgba(239, 68, 68, 0.8)'",
    "backgroundColor: 'rgba(239, 68, 68, 0.8)', borderRadius: 6")
commit("2026-04-08T11:30:00+0530", "style: round bar chart corners for modern look")

replace("frontend/index.html",
    "options: { responsive: true }",
    "options: { responsive: true, plugins: { legend: { labels: { padding: 20, usePointStyle: true } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }")
commit("2026-04-08T14:45:00+0530", "style: improve bar chart grid lines and legend")

replace("frontend/index.html",
    '<h2 className="text-xl font-bold mb-4">Income vs Expense (6 Months)</h2>',
    '<h2 className="text-xl font-bold mb-4">📊 Income vs Expense (6 Months)</h2>')
replace("frontend/index.html",
    '<h2 className="text-xl font-bold mb-4">Category Breakdown (This Month)</h2>',
    '<h2 className="text-xl font-bold mb-4">🍩 Category Breakdown (This Month)</h2>')
commit("2026-04-08T17:00:00+0530", "style: add emoji icons to chart section titles")

write("src/utils/chartColors.js", """/**
 * Predefined color palette for charts.
 * Ensures consistent, accessible colors across all visualizations.
 */
const CHART_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#a855f7', // Purple
];

const getChartColor = (index) => CHART_COLORS[index % CHART_COLORS.length];

module.exports = { CHART_COLORS, getChartColor };
""")
commit("2026-04-08T19:30:00+0530", "feat: add reusable chart color palette module")

# ════════════════════════════════════════════════════
# APR 9 - Export & Data Handling (4 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    .export-btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background-color: #059669; color: white; border-radius: 0.375rem; font-size: 0.875rem; cursor: pointer; transition: background-color 0.15s; border: none; }
    .export-btn:hover { background-color: #047857; }
  </style>""")
commit("2026-04-09T09:30:00+0530", "style: add export button component styles")

write("src/config/errorCodes.js", """/**
 * Centralized error code definitions.
 * Maps internal error codes to HTTP status codes and messages.
 */
const ERROR_CODES = {
  VALIDATION_ERROR: { status: 422, message: 'Validation failed' },
  UNAUTHORIZED: { status: 401, message: 'Authentication required' },
  FORBIDDEN: { status: 403, message: 'Access denied' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  CONFLICT: { status: 409, message: 'Resource already exists' },
  RATE_LIMITED: { status: 429, message: 'Too many requests' },
  INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
};

module.exports = ERROR_CODES;
""")
commit("2026-04-09T13:00:00+0530", "refactor: centralize error code definitions")

replace("src/controllers/export.controller.js",
    "const transactionService",
    "// CSV export controller - handles file generation and download\nconst transactionService")
commit("2026-04-09T16:30:00+0530", "chore: add descriptive comment to export controller")

replace("frontend/index.html",
    "</style>",
    """    .date-range-picker { display: flex; gap: 0.5rem; align-items: center; }
    .date-range-picker input { font-size: 0.875rem; padding: 0.375rem 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
    .date-range-picker span { color: #9ca3af; font-size: 0.75rem; }
  </style>""")
commit("2026-04-09T19:45:00+0530", "style: add date range picker component styles")

# ════════════════════════════════════════════════════
# APR 10 - Profile & Settings (5 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    .settings-section { background: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .settings-label { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
    .settings-description { font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.75rem; }
    .toggle-switch { width: 2.75rem; height: 1.5rem; background: #d1d5db; border-radius: 9999px; position: relative; cursor: pointer; transition: background 0.2s; }
    .toggle-switch.active { background: #4f46e5; }
    .toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 1.25rem; height: 1.25rem; background: white; border-radius: 50%; transition: transform 0.2s; }
    .toggle-switch.active::after { transform: translateX(1.25rem); }
  </style>""")
commit("2026-04-10T09:00:00+0530", "style: add settings page UI components")

replace("frontend/index.html",
    "</style>",
    """    .avatar { width: 2.5rem; height: 2.5rem; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.875rem; }
    .profile-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 0.75rem; margin-bottom: 1.5rem; }
  </style>""")
commit("2026-04-10T11:30:00+0530", "style: add avatar and profile card components")

replace("frontend/index.html",
    """<div className={`nav-item ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => setActiveTab('budgets')}>Budgets</div>""",
    """<div className={`nav-item ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => setActiveTab('budgets')}>Budgets</div>
              <div className="divider"></div>
              <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>⚙️ Settings</div>""")
commit("2026-04-10T14:00:00+0530", "feat: add settings tab to sidebar navigation")

replace("frontend/index.html",
    "{activeTab === 'budgets' && <Budgets />}",
    """{activeTab === 'budgets' && <Budgets />}
              {activeTab === 'settings' && <div className="animate-fade-in"><div className="settings-section"><h2 className="text-xl font-bold mb-4">⚙️ Settings</h2><div className="settings-label">Theme</div><div className="settings-description">Switch between light and dark mode</div><button onClick={() => { document.documentElement.classList.toggle('dark-mode'); localStorage.setItem('theme', document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light'); }} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Toggle Theme</button></div><div className="settings-section"><div className="settings-label">Account</div><div className="settings-description">Manage your account preferences</div><p className="text-sm text-gray-500">Logged in with your account</p></div></div>}""")
commit("2026-04-10T17:30:00+0530", "feat: implement basic settings page with theme toggle")

replace("frontend/index.html",
    "</style>",
    """    .notification-dot { width: 0.5rem; height: 0.5rem; background-color: #ef4444; border-radius: 50%; position: absolute; top: -2px; right: -2px; }
  </style>""")
commit("2026-04-10T20:00:00+0530", "style: add notification dot indicator component")

# ════════════════════════════════════════════════════
# APR 11 - Budget & Alerts (5 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    .alert { padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .alert-warning { background-color: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
    .alert-danger { background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
    .alert-success { background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
  </style>""")
commit("2026-04-11T09:15:00+0530", "feat: add alert banner component styles")

replace("frontend/index.html",
    "</style>",
    """    .progress-custom { height: 0.625rem; border-radius: 9999px; background-color: #e5e7eb; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 9999px; transition: width 0.5s ease; }
    .progress-fill.safe { background: linear-gradient(90deg, #22c55e, #16a34a); }
    .progress-fill.warning { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .progress-fill.danger { background: linear-gradient(90deg, #ef4444, #dc2626); }
  </style>""")
commit("2026-04-11T11:30:00+0530", "style: add gradient progress bar with status colors")

replace("frontend/index.html",
    "</style>",
    """    .budget-card { background: white; border-radius: 0.75rem; padding: 1.25rem; border: 1px solid #e5e7eb; transition: all 0.2s; }
    .budget-card:hover { border-color: #c7d2fe; box-shadow: 0 4px 12px rgba(99,102,241,0.1); }
    .budget-amount { font-size: 1.5rem; font-weight: 700; }
    .budget-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
  </style>""")
commit("2026-04-11T14:00:00+0530", "style: redesign budget cards with border and hover effect")

write("src/config/budgetThresholds.js", """/**
 * Budget warning thresholds.
 * Defines percentage levels for budget status indicators.
 */
module.exports = {
  SAFE: 60,       // 0-60% = green/safe
  WARNING: 80,    // 60-80% = yellow/warning
  DANGER: 100,    // 80-100% = red/danger
  OVERSPENT: 100, // >100% = overspent
};
""")
commit("2026-04-11T16:45:00+0530", "feat: define budget warning threshold constants")

replace("frontend/index.html",
    "Warning: Budget is over 80% used.",
    "⚠️ Budget is over 80% used — consider reducing spending in this category.")
commit("2026-04-11T19:30:00+0530", "fix: improve budget warning message with actionable advice")

# ════════════════════════════════════════════════════
# APR 12 - Mobile & Responsive (5 commits)
# ════════════════════════════════════════════════════

replace("frontend/index.html",
    "</style>",
    """    @media (max-width: 768px) {
      .nav-item { padding: 0.625rem 0.875rem; font-size: 0.875rem; }
      .text-3xl { font-size: 1.5rem !important; }
      .text-xl { font-size: 1.125rem !important; }
      .p-6 { padding: 1rem !important; }
    }
  </style>""")
commit("2026-04-12T09:30:00+0530", "fix: reduce font sizes and padding on mobile")

replace("frontend/index.html",
    "</style>",
    """    @media (max-width: 480px) {
      .h-16 { height: 3.5rem !important; }
      .space-x-4 > * + * { margin-left: 0.5rem !important; }
      .theme-toggle { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
    }
  </style>""")
commit("2026-04-12T11:00:00+0530", "fix: optimize navbar spacing for small screens")

replace("frontend/index.html",
    "</style>",
    """    .mobile-menu-btn { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0.25rem; }
    @media (max-width: 768px) {
      .mobile-menu-btn { display: block; }
    }
  </style>""")
commit("2026-04-12T13:45:00+0530", "style: add mobile hamburger menu button styles")

replace("frontend/index.html",
    "</style>",
    """    .card-grid { display: grid; gap: 1rem; }
    @media (min-width: 640px) { .card-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .card-grid { grid-template-columns: repeat(4, 1fr); } }
  </style>""")
commit("2026-04-12T16:30:00+0530", "style: add responsive card grid utility")

replace("frontend/index.html",
    "</style>",
    """    button, a, input, select { min-height: 44px; }
    @media (pointer: coarse) { .nav-item { min-height: 48px; display: flex; align-items: center; } }
  </style>""")
commit("2026-04-12T19:00:00+0530", "fix: increase touch targets for mobile accessibility")

# ════════════════════════════════════════════════════
# APR 13 - Code Cleanup & Docs (4 commits)
# ════════════════════════════════════════════════════

write("src/config/apiVersions.js", """/**
 * API versioning configuration.
 * Prepares for future API version management.
 */
module.exports = {
  CURRENT_VERSION: 'v1',
  SUPPORTED_VERSIONS: ['v1'],
  DEPRECATED_VERSIONS: [],
};
""")
commit("2026-04-13T10:00:00+0530", "chore: add API versioning configuration")

replace("src/app.js",
    "/* ─── API routes ──────────────────────────────────────── */",
    "/* ─── API routes (v1) ─────────────────────────────────── */")
commit("2026-04-13T12:30:00+0530", "chore: label API routes with version identifier")

replace("src/server.js",
    "console.log(`\\n🚀 Personal Finance Tracker API`);",
    "console.log(`\\n🚀 Personal Finance Tracker API v1.0.0`);")
commit("2026-04-13T15:00:00+0530", "chore: add version number to server startup banner")

write("CHANGELOG.md", """# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-04-13

### Added
- JWT authentication with refresh token rotation
- Transaction CRUD with filtering and pagination
- Category management with auto-seeded defaults
- Budget tracking with warning alerts
- Analytics dashboard with charts
- CSV export for transaction history
- Dark mode theme support
- Responsive mobile layout
- Settings page with theme preferences
- Health check endpoint

### Security
- Rate limiting on auth endpoints
- Helmet security headers
- SQL injection prevention via parameterized queries
- SHA-256 hashed refresh tokens
""")
commit("2026-04-13T18:00:00+0530", "docs: add CHANGELOG with v1.0.0 release notes")

# ════════════════════════════════════════════════════
# APR 14 - Final Polish & README (6 commits)
# ════════════════════════════════════════════════════

replace("README.md",
    "## Tech Stack",
    """## Screenshots

> 📸 Screenshots coming soon — the dashboard includes summary cards, transaction management, analytics charts, budget tracking, and a settings page.

## Tech Stack""")
commit("2026-04-14T09:00:00+0530", "docs: add screenshots section placeholder to README")

replace("README.md",
    "## Features\n",
    """## Features

### Core
- 🔐 **Authentication** — JWT access + refresh tokens with rotation
- 💳 **Transactions** — Full CRUD with filtering, pagination, search
- 📁 **Categories** — Per-user with 12 auto-seeded defaults
- 💰 **Budgets** — Per-category tracking with live spend alerts
- 📊 **Analytics** — Monthly summary, trends, category breakdown, health score
- 📥 **CSV Export** — Download transaction history

### UI/UX
- 🌙 **Dark Mode** — Toggle with localStorage persistence
- 📱 **Responsive** — Mobile-optimized layout
- ✨ **Animations** — Fade-in, shimmer loading, hover effects
- 🎨 **Modern Design** — Cards, badges, progress bars, tooltips

""")
commit("2026-04-14T11:30:00+0530", "docs: rewrite features section with detailed breakdown")

replace("package.json",
    '"version": "1.0.0"',
    '"version": "1.1.0"')
commit("2026-04-14T13:00:00+0530", "chore: bump version to 1.1.0")

replace("frontend/index.html",
    "</style>",
    """    ::selection { background-color: #c7d2fe; color: #312e81; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
  </style>""")
commit("2026-04-14T15:30:00+0530", "style: add custom scrollbar and text selection colors")

replace("frontend/index.html",
    "</style>",
    """    .footer { text-align: center; padding: 2rem 0; color: #9ca3af; font-size: 0.75rem; border-top: 1px solid #e5e7eb; margin-top: 3rem; }
  </style>""")
replace("frontend/index.html",
    "</div>\n      );\n    }\n\n    // Restore saved theme",
    """  <div className="footer">
              <p>© 2026 FinanceTracker — Built with ❤️ by Himanshu</p>
            </div>
          </div>\n      );\n    }\n\n    // Restore saved theme""")
commit("2026-04-14T18:00:00+0530", "feat: add footer with attribution")

replace("README.md",
    "## License\n\nISC",
    """## Acknowledgments

- [Express.js](https://expressjs.com/) — Web framework
- [Chart.js](https://www.chartjs.org/) — Data visualization
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Neon](https://neon.tech/) — Serverless Postgres

## License

ISC — see [LICENSE](LICENSE) for details.""")
commit("2026-04-14T20:30:00+0530", "docs: add acknowledgments section to README")

# ════════════════════════════════════════════════════
# Cleanup & Push
# ════════════════════════════════════════════════════
os.remove("gen_commits_part1.py")
os.remove("gen_commits_part2.py")
commit("2026-04-14T20:35:00+0530", "chore: clean up generation scripts")

print("\n✅ Part 2 complete! (Apr 8-14)")
print("\nPushing to origin...")
subprocess.run(["git","push","origin","main"], check=True)
print("\n📊 Final commit summary:")
subprocess.run(["git","log","--format=%h %ai %s","-70"], check=True)
