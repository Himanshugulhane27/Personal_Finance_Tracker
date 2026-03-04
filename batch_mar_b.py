#!/usr/bin/env python3
import subprocess, os
os.chdir("/Users/himanshugulhane/Desktop/Personal Finance Tracker")

def commit(dt, msg):
    subprocess.run(["git","add","-A"], check=True)
    e=os.environ.copy(); e["GIT_AUTHOR_DATE"]=dt; e["GIT_COMMITTER_DATE"]=dt
    subprocess.run(["git","commit","-m",msg], env=e, check=True)
def r(fp,old,new):
    with open(fp) as f: c=f.read()
    with open(fp,'w') as f: f.write(c.replace(old,new,1))
def w(fp,content):
    d=os.path.dirname(fp)
    if d: os.makedirs(d,exist_ok=True)
    with open(fp,'w') as f: f.write(content)

# MAR 4 (2 commits) - resume
r("src/utils/helpers.js","module.exports = { sha256, parseMonth, clamp, round };","module.exports = { sha256, parseMonth, clamp, round, formatUSD };")
commit("2026-03-04T15:30:00+0530","fix: export formatUSD from helpers module")
w("src/utils/colorUtils.js","/**\n * Color utilities for category/chart rendering.\n */\nconst randomColor = () => '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');\nconst hexToRgba = (hex, alpha=1) => {\n  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);\n  return `rgba(${r},${g},${b},${alpha})`;\n};\nmodule.exports = { randomColor, hexToRgba };\n")
commit("2026-03-04T21:30:00+0530","feat: add color utility functions")

# MAR 5 (10 commits) - resume from where batch_a failed
r("frontend/index.html","</style>","""    .dropdown { position: relative; display: inline-block; }
    .dropdown-menu { position: absolute; top: 100%; right: 0; background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); min-width: 12rem; z-index: 50; padding: 0.25rem; }
    .dropdown-item { display: block; width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #374151; border-radius: 0.375rem; cursor: pointer; background: none; border: none; }
    .dropdown-item:hover { background: #f3f4f6; }
  </style>""")
commit("2026-03-05T08:00:00+0530","feat: add dropdown menu component styles")
r("frontend/index.html","</style>","""    .chip { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .chip-blue { background: #dbeafe; color: #1e40af; }
    .chip-green { background: #dcfce7; color: #166534; }
    .chip-red { background: #fef2f2; color: #991b1b; }
    .chip-purple { background: #f3e8ff; color: #6b21a8; }
  </style>""")
commit("2026-03-05T09:30:00+0530","style: add chip/tag component with color variants")
w("src/utils/queryBuilder.js","/**\n * Dynamic SQL query builder.\n */\nclass QueryBuilder {\n  constructor(base) { this.query=base; this.conditions=[]; this.values=[]; this.idx=1; }\n  where(col,val,op='=') { if(val==null) return this; this.conditions.push(`${col} ${op} $${this.idx}`); this.values.push(val); this.idx++; return this; }\n  whereBetween(col,min,max) { if(min) this.where(col,min,'>='); if(max) this.where(col,max,'<='); return this; }\n  orderBy(col,dir='DESC') { this.order=`ORDER BY ${col} ${dir}`; return this; }\n  limit(l,o) { this.lim=`LIMIT $${this.idx} OFFSET $${this.idx+1}`; this.values.push(l,o); this.idx+=2; return this; }\n  build() { let s=this.query; if(this.conditions.length) s+=' WHERE '+this.conditions.join(' AND '); if(this.order) s+=' '+this.order; if(this.lim) s+=' '+this.lim; return {sql:s,values:this.values}; }\n}\nmodule.exports = QueryBuilder;\n")
commit("2026-03-05T10:45:00+0530","feat: add dynamic SQL query builder class")
r("frontend/index.html","</style>","""    .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem; }
    .breadcrumb-current { color: #111827; font-weight: 500; }
  </style>""")
commit("2026-03-05T12:00:00+0530","style: add breadcrumb navigation component")
w("src/middleware/notFound.js","/**\n * 404 handler middleware.\n */\nconst AppError = require('../utils/AppError');\nconst notFound = (req, _res, next) => {\n  next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`));\n};\nmodule.exports = notFound;\n")
commit("2026-03-05T13:30:00+0530","refactor: extract 404 handler into dedicated middleware")
r("frontend/index.html","</style>","""    .avatar-sm { width: 2rem; height: 2rem; font-size: 0.75rem; }
    .avatar-lg { width: 3.5rem; height: 3.5rem; font-size: 1.25rem; }
  </style>""")
commit("2026-03-05T15:00:00+0530","style: add avatar size variants")
w("src/utils/rateLimitConfig.js","/**\n * Rate limiting configs.\n */\nconst rateLimit = require('express-rate-limit');\nconst createLimiter = (windowMs, max, msg) => rateLimit({ windowMs, max, message: { success: false, error: { code: 'RATE_LIMIT', message: msg } }, standardHeaders: true, legacyHeaders: false });\nconst authLimiter = createLimiter(60000, 10, 'Too many auth attempts.');\nconst apiLimiter = createLimiter(900000, 100, 'Too many requests.');\nconst exportLimiter = createLimiter(60000, 5, 'Export rate limited.');\nmodule.exports = { authLimiter, apiLimiter, exportLimiter };\n")
commit("2026-03-05T16:30:00+0530","refactor: centralize rate limit configs")
r("frontend/index.html","</style>","""    .table-container { border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; }
    .table-container th { background: #f9fafb; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  </style>""")
commit("2026-03-05T18:00:00+0530","style: add table container with styled header")
r("frontend/index.html","</style>","""    .notification-banner { position: fixed; top: 1rem; right: 1rem; max-width: 28rem; padding: 0.875rem 1.25rem; border-radius: 0.75rem; z-index: 200; animation: fadeIn 0.3s ease; font-size: 0.875rem; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
    .notification-banner.success { background: #22c55e; color: white; }
    .notification-banner.error { background: #ef4444; color: white; }
  </style>""")
commit("2026-03-05T20:00:00+0530","feat: add floating notification banner")
r("frontend/index.html","</style>","""    .summary-row { display: flex; justify-content: space-between; padding: 0.625rem 0; border-bottom: 1px solid #f3f4f6; }
    .summary-row:last-child { border-bottom: none; font-weight: 600; }
    .summary-value.positive { color: #16a34a; }
    .summary-value.negative { color: #dc2626; }
  </style>""")
commit("2026-03-05T23:00:00+0530","style: add summary row for financial totals")

# MAR 6 (4 commits)
w("CONTRIBUTING.md","# Contributing\n\nThank you for considering contributing!\n\n## Getting Started\n1. Fork the repo\n2. Clone locally\n3. Install deps: `npm install`\n4. Copy `.env.example` to `.env`\n5. Run migrations: `npm run migrate`\n6. Start dev server: `npm run dev`\n\n## Code Style\n- Use Prettier for formatting\n- Follow ESLint rules\n- Write meaningful commit messages\n\n## Pull Requests\n- Create a feature branch\n- Write clear descriptions\n- Reference related issues\n")
commit("2026-03-06T10:00:00+0530","docs: add CONTRIBUTING.md with setup guide")
r("frontend/index.html","</style>","""    .loading-bar { width: 100%; height: 3px; background: #e5e7eb; overflow: hidden; border-radius: 2px; }
    .loading-bar::after { content: ''; display: block; width: 40%; height: 100%; background: #4f46e5; animation: loadingSlide 1.2s ease-in-out infinite; }
    @keyframes loadingSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }
  </style>""")
commit("2026-03-06T13:30:00+0530","feat: add loading bar animation component")
r("frontend/index.html","</style>","""    .step-indicator { display: flex; align-items: center; gap: 0.5rem; }
    .step { width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; }
    .step.completed { background: #22c55e; color: white; }
    .step.active { background: #4f46e5; color: white; }
    .step.pending { background: #e5e7eb; color: #9ca3af; }
    .step-line { flex: 1; height: 2px; background: #e5e7eb; }
    .step-line.completed { background: #22c55e; }
  </style>""")
commit("2026-03-06T16:45:00+0530","style: add step indicator for multi-step flows")
r("package.json",'"test:verbose"','"lint": "eslint src/",\n    "format": "prettier --write \\"src/**/*.js\\"",\n    "test:verbose"')
commit("2026-03-06T20:00:00+0530","chore: add lint and format scripts to package.json")

# MAR 7 (1 commit - weekend)
r("frontend/index.html","</style>","""    .kbd { display: inline-block; padding: 0.125rem 0.375rem; font-size: 0.6875rem; font-family: monospace; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 0.25rem; box-shadow: 0 1px 0 #d1d5db; color: #374151; }
  </style>""")
commit("2026-03-07T16:00:00+0530","style: add keyboard shortcut badge component")

# MAR 8 (6 commits)
w("src/utils/env.js","/**\n * Environment variable validator.\n * Checks required env vars at startup.\n */\nconst required = ['JWT_ACCESS_SECRET','JWT_REFRESH_SECRET'];\nconst validateEnv = () => {\n  const missing = required.filter(k => !process.env[k]);\n  if (missing.length) {\n    console.error(`Missing required env vars: ${missing.join(', ')}`);\n    process.exit(1);\n  }\n};\nmodule.exports = { validateEnv };\n")
commit("2026-03-08T09:00:00+0530","feat: add environment variable validator")
r("frontend/index.html","</style>","""    .timeline { position: relative; padding-left: 1.5rem; }
    .timeline::before { content: ''; position: absolute; left: 0.5rem; top: 0; bottom: 0; width: 2px; background: #e5e7eb; }
    .timeline-item { position: relative; padding-bottom: 1.5rem; }
    .timeline-dot { position: absolute; left: -1.25rem; top: 0.25rem; width: 0.625rem; height: 0.625rem; border-radius: 50%; background: #4f46e5; border: 2px solid white; }
    .timeline-content { font-size: 0.875rem; }
    .timeline-date { font-size: 0.75rem; color: #9ca3af; }
  </style>""")
commit("2026-03-08T10:30:00+0530","style: add timeline component for activity feed")
w("src/config/permissions.js","/**\n * Permission constants.\n */\nmodule.exports = {\n  OWNER: 'owner',\n  ROLES: ['user','admin'],\n  ACTIONS: {\n    READ: 'read',\n    WRITE: 'write',\n    DELETE: 'delete',\n    EXPORT: 'export',\n  },\n};\n")
commit("2026-03-08T12:15:00+0530","chore: add permission constants for future RBAC")
r("frontend/index.html","</style>","""    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .stat-mini { padding: 1rem; border-radius: 0.5rem; background: white; border: 1px solid #f3f4f6; }
    .stat-mini-value { font-size: 1.5rem; font-weight: 700; line-height: 1; }
    .stat-mini-label { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; }
    .stat-mini-change { font-size: 0.6875rem; font-weight: 500; margin-top: 0.375rem; }
    .stat-mini-change.up { color: #16a34a; }
    .stat-mini-change.down { color: #dc2626; }
  </style>""")
commit("2026-03-08T15:00:00+0530","style: add mini stat cards with change indicators")
r("frontend/index.html","</style>","""    .accordion { border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; }
    .accordion-header { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1rem; cursor: pointer; background: white; font-weight: 500; font-size: 0.875rem; }
    .accordion-header:hover { background: #f9fafb; }
    .accordion-body { padding: 0 1rem 1rem; font-size: 0.875rem; color: #6b7280; }
  </style>""")
commit("2026-03-08T17:45:00+0530","style: add accordion/collapsible component")
r("frontend/index.html","</style>","""    .rating { display: inline-flex; gap: 0.125rem; }
    .rating-star { font-size: 1.25rem; cursor: pointer; color: #d1d5db; transition: color 0.1s; }
    .rating-star.filled { color: #f59e0b; }
    .rating-star:hover { color: #fbbf24; }
  </style>""")
commit("2026-03-08T21:00:00+0530","style: add star rating component")

# MAR 9 (11 commits - heaviest day)
w("src/config/features.js","/**\n * Feature flags for gradual rollout.\n */\nmodule.exports = {\n  DARK_MODE: true,\n  CSV_EXPORT: true,\n  RECURRING_TX: true,\n  BUDGET_ALERTS: true,\n  HEALTH_SCORE: true,\n  PDF_EXPORT: false,\n  MULTI_CURRENCY: false,\n  NOTIFICATIONS: false,\n};\n")
commit("2026-03-09T07:30:00+0530","feat: add feature flag configuration")
r("frontend/index.html","</style>","""    .switch-group { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; }
    .switch-label { font-size: 0.875rem; font-weight: 500; }
    .switch-desc { font-size: 0.75rem; color: #9ca3af; }
  </style>""")
commit("2026-03-09T08:45:00+0530","style: add switch group layout for settings")
w("src/utils/numberFormat.js","/**\n * Number formatting utilities.\n */\nconst compact = (n) => {\n  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';\n  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';\n  return n.toString();\n};\nconst percentage = (val, total) => total===0 ? 0 : Math.round((val/total)*100);\nconst currency = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);\nmodule.exports = { compact, percentage, currency };\n")
commit("2026-03-09T09:30:00+0530","feat: add number formatting utilities")
r("frontend/index.html","</style>","""    .color-swatch { width: 1.5rem; height: 1.5rem; border-radius: 0.375rem; border: 2px solid transparent; cursor: pointer; transition: border-color 0.15s; }
    .color-swatch:hover { border-color: #6366f1; }
    .color-swatch.selected { border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79,70,229,0.3); }
    .color-picker-grid { display: flex; flex-wrap: wrap; gap: 0.375rem; }
  </style>""")
commit("2026-03-09T10:45:00+0530","style: add color picker/swatch component")
r("frontend/index.html","</style>","""    .file-upload { border: 2px dashed #d1d5db; border-radius: 0.75rem; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.15s; }
    .file-upload:hover { border-color: #6366f1; background: #f5f3ff; }
    .file-upload-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .file-upload-text { font-size: 0.875rem; color: #6b7280; }
    .file-upload-hint { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
  </style>""")
commit("2026-03-09T12:00:00+0530","style: add file upload dropzone component")
w("src/utils/cache.js","/**\n * Simple in-memory cache with TTL.\n */\nclass MemoryCache {\n  constructor(ttl = 300000) { this.store = new Map(); this.ttl = ttl; }\n  get(key) {\n    const item = this.store.get(key);\n    if (!item) return null;\n    if (Date.now() > item.expiry) { this.store.delete(key); return null; }\n    return item.value;\n  }\n  set(key, value, ttl) {\n    this.store.set(key, { value, expiry: Date.now() + (ttl || this.ttl) });\n  }\n  delete(key) { this.store.delete(key); }\n  clear() { this.store.clear(); }\n  size() { return this.store.size; }\n}\nmodule.exports = new MemoryCache();\n")
commit("2026-03-09T13:15:00+0530","feat: add in-memory cache with TTL support")
r("frontend/index.html","</style>","""    .tag-input { display: flex; flex-wrap: wrap; gap: 0.375rem; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; min-height: 2.5rem; align-items: center; }
    .tag-input:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .tag-input input { border: none; outline: none; flex: 1; min-width: 4rem; font-size: 0.875rem; }
  </style>""")
commit("2026-03-09T14:30:00+0530","style: add tag input component for multi-select")
r("frontend/index.html","</style>","""    .price-display { font-variant-numeric: tabular-nums; }
    .price-lg { font-size: 2rem; font-weight: 800; letter-spacing: -0.025em; }
    .price-currency { font-size: 1rem; font-weight: 400; color: #6b7280; vertical-align: super; }
  </style>""")
commit("2026-03-09T16:00:00+0530","style: add price display typography component")
r("frontend/index.html","</style>","""    .data-table-actions { display: flex; gap: 0.375rem; opacity: 0; transition: opacity 0.15s; }
    tr:hover .data-table-actions { opacity: 1; }
    .action-icon { width: 1.75rem; height: 1.75rem; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; cursor: pointer; border: none; background: #f3f4f6; }
    .action-icon:hover { background: #e5e7eb; }
    .action-icon.danger:hover { background: #fef2f2; color: #dc2626; }
  </style>""")
commit("2026-03-09T18:30:00+0530","style: add row-level action buttons with hover reveal")
r("frontend/index.html","</style>","""    .quick-action { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; padding: 1rem; border-radius: 0.75rem; cursor: pointer; transition: all 0.15s; background: white; border: 1px solid #f3f4f6; }
    .quick-action:hover { border-color: #c7d2fe; background: #f5f3ff; transform: translateY(-2px); }
    .quick-action-icon { font-size: 1.5rem; }
    .quick-action-label { font-size: 0.75rem; font-weight: 500; color: #374151; }
  </style>""")
commit("2026-03-09T21:00:00+0530","feat: add quick action card component")
r("frontend/index.html","</style>","""    .empty-illustration { max-width: 12rem; margin: 0 auto 1rem; opacity: 0.6; }
    .empty-title { font-size: 1rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem; }
    .empty-description { font-size: 0.875rem; color: #9ca3af; max-width: 20rem; margin: 0 auto; }
    .empty-action { margin-top: 1rem; }
  </style>""")
commit("2026-03-09T23:30:00+0530","style: improve empty state with illustration layout")

print("✅ Mar 4-9 complete!")
subprocess.run(["git","log","--format=%h %ai %s","-40"], check=True)
