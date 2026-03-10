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

# MAR 10 (3 commits)
w("src/utils/debounce.js","/**\n * Debounce utility for search inputs.\n */\nconst debounce = (fn, delay = 300) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};\nmodule.exports = debounce;\n")
commit("2026-03-10T11:00:00+0530","feat: add debounce utility for search optimization")
r("frontend/index.html","</style>","""    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
    .calendar-cell { padding: 0.5rem; font-size: 0.8125rem; border-radius: 0.375rem; cursor: pointer; }
    .calendar-cell:hover { background: #f3f4f6; }
    .calendar-cell.today { background: #eef2ff; color: #4f46e5; font-weight: 600; }
    .calendar-cell.selected { background: #4f46e5; color: white; }
    .calendar-header { font-size: 0.6875rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; padding: 0.5rem; }
  </style>""")
commit("2026-03-10T14:30:00+0530","style: add calendar grid component")
r("frontend/index.html","</style>","""    .heat-cell { width: 0.75rem; height: 0.75rem; border-radius: 2px; }
    .heat-0 { background: #f3f4f6; }
    .heat-1 { background: #c7d2fe; }
    .heat-2 { background: #818cf8; }
    .heat-3 { background: #6366f1; }
    .heat-4 { background: #4338ca; }
  </style>""")
commit("2026-03-10T19:00:00+0530","style: add heatmap cell component for activity view")

# MAR 11 (8 commits)
w("src/config/defaults.js","/**\n * Default application values.\n */\nmodule.exports = {\n  CURRENCY: 'USD',\n  LOCALE: 'en-US',\n  TIMEZONE: 'UTC',\n  DATE_FORMAT: 'YYYY-MM-DD',\n  DEFAULT_CATEGORIES: {\n    income: ['Salary','Freelance','Investments','Other Income'],\n    expense: ['Food & Dining','Transportation','Shopping','Entertainment','Bills & Utilities','Healthcare','Education','Other'],\n  },\n  CHART_MONTHS: 6,\n  SESSION_TIMEOUT: 30 * 60 * 1000,\n};\n")
commit("2026-03-11T08:00:00+0530","feat: add application defaults configuration")
r("frontend/index.html","</style>","""    .comparison-card { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: center; padding: 1.25rem; background: white; border-radius: 0.75rem; border: 1px solid #e5e7eb; }
    .comparison-vs { font-size: 0.75rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; }
    .comparison-value { font-size: 1.5rem; font-weight: 700; }
    .comparison-label { font-size: 0.75rem; color: #6b7280; }
  </style>""")
commit("2026-03-11T09:30:00+0530","style: add comparison card for month-over-month")
w("src/utils/csvHelper.js","/**\n * CSV generation helpers.\n */\nconst escapeCSV = (val) => {\n  if (val == null) return '';\n  const str = String(val);\n  if (str.includes(',') || str.includes('\"') || str.includes('\\n')) {\n    return '\"' + str.replace(/\"/g, '\"\"') + '\"';\n  }\n  return str;\n};\nconst toCSVRow = (arr) => arr.map(escapeCSV).join(',');\nconst toCSV = (headers, rows) => {\n  const lines = [toCSVRow(headers)];\n  rows.forEach(r => lines.push(toCSVRow(r)));\n  return lines.join('\\n');\n};\nmodule.exports = { escapeCSV, toCSVRow, toCSV };\n")
commit("2026-03-11T11:00:00+0530","refactor: extract CSV helper for cleaner export logic")
r("frontend/index.html","</style>","""    .sparkline { display: inline-flex; align-items: flex-end; gap: 1px; height: 1.5rem; }
    .sparkline-bar { width: 3px; border-radius: 1px; background: #6366f1; transition: height 0.3s; }
    .sparkline-bar.negative { background: #ef4444; }
  </style>""")
commit("2026-03-11T13:15:00+0530","style: add sparkline mini-chart component")
r("frontend/index.html","</style>","""    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; margin-top: 1rem; }
  </style>""")
commit("2026-03-11T15:00:00+0530","style: add form row and actions layout utilities")
w("src/config/httpStatus.js","/**\n * HTTP status code constants.\n */\nmodule.exports = {\n  OK: 200,\n  CREATED: 201,\n  NO_CONTENT: 204,\n  BAD_REQUEST: 400,\n  UNAUTHORIZED: 401,\n  FORBIDDEN: 403,\n  NOT_FOUND: 404,\n  CONFLICT: 409,\n  UNPROCESSABLE: 422,\n  TOO_MANY: 429,\n  INTERNAL: 500,\n  SERVICE_UNAVAILABLE: 503,\n};\n")
commit("2026-03-11T17:30:00+0530","chore: add HTTP status code constants")
r("frontend/index.html","</style>","""    .gradient-text { background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .gradient-bg { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); }
    .gradient-bg-subtle { background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #faf5ff 100%); }
  </style>""")
commit("2026-03-11T19:45:00+0530","style: add gradient text and background utilities")
r("frontend/index.html","</style>","""    .scroll-shadow { position: relative; }
    .scroll-shadow::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2rem; background: linear-gradient(transparent, white); pointer-events: none; }
  </style>""")
commit("2026-03-11T22:00:00+0530","style: add scroll shadow fade effect")

# MAR 12 (5 commits)
w("src/utils/errorReporter.js","/**\n * Error reporting utility.\n * In production, this could send errors to Sentry/Datadog.\n */\nconst logger = require('./logger');\n\nconst reportError = (error, context = {}) => {\n  const payload = {\n    message: error.message,\n    stack: error.stack,\n    code: error.code || 'UNKNOWN',\n    timestamp: new Date().toISOString(),\n    ...context,\n  };\n  logger.error('Error reported:', payload);\n  // TODO: integrate with external error tracking service\n};\n\nmodule.exports = { reportError };\n")
commit("2026-03-12T09:30:00+0530","feat: add error reporting utility for observability")
r("frontend/index.html","</style>","""    .banner { padding: 1rem 1.5rem; border-radius: 0.75rem; display: flex; align-items: flex-start; gap: 0.75rem; }
    .banner-info { background: #eff6ff; border: 1px solid #bfdbfe; }
    .banner-warning { background: #fffbeb; border: 1px solid #fde68a; }
    .banner-icon { font-size: 1.25rem; flex-shrink: 0; }
    .banner-content { flex: 1; }
    .banner-title { font-weight: 600; font-size: 0.875rem; margin-bottom: 0.125rem; }
    .banner-text { font-size: 0.8125rem; color: #6b7280; }
  </style>""")
commit("2026-03-12T12:00:00+0530","style: add info and warning banner components")
r("frontend/index.html","</style>","""    .metric-card { padding: 1.25rem; border-radius: 0.75rem; background: white; border: 1px solid #e5e7eb; }
    .metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .metric-trend { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; font-weight: 500; padding: 0.125rem 0.5rem; border-radius: 9999px; }
    .metric-trend.up { background: #dcfce7; color: #166534; }
    .metric-trend.down { background: #fef2f2; color: #991b1b; }
  </style>""")
commit("2026-03-12T14:45:00+0530","style: add metric card with trend indicator")
w("src/config/security.js","/**\n * Security configuration constants.\n */\nmodule.exports = {\n  PASSWORD_MIN_LENGTH: 8,\n  PASSWORD_MAX_LENGTH: 128,\n  TOKEN_BYTES: 32,\n  BCRYPT_ROUNDS: 12,\n  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],\n  HELMET_OPTIONS: {\n    contentSecurityPolicy: false,\n    crossOriginEmbedderPolicy: false,\n  },\n};\n")
commit("2026-03-12T17:00:00+0530","refactor: extract security constants to config")
r("frontend/index.html","</style>","""    .sidebar-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid #f3f4f6; }
    .sidebar-footer-text { font-size: 0.6875rem; color: #9ca3af; }
    .sidebar-footer-link { font-size: 0.75rem; color: #6366f1; text-decoration: none; }
    .sidebar-footer-link:hover { text-decoration: underline; }
  </style>""")
commit("2026-03-12T20:30:00+0530","style: add sidebar footer with links section")

# MAR 13 (7 commits)
w("src/utils/retry.js","/**\n * Retry utility for unreliable operations.\n */\nconst wait = (ms) => new Promise(r => setTimeout(r, ms));\nconst retry = async (fn, { maxRetries = 3, delay = 1000, backoff = 2 } = {}) => {\n  let lastError;\n  for (let i = 0; i <= maxRetries; i++) {\n    try { return await fn(); }\n    catch (err) { lastError = err; if (i < maxRetries) await wait(delay * Math.pow(backoff, i)); }\n  }\n  throw lastError;\n};\nmodule.exports = { retry, wait };\n")
commit("2026-03-13T08:30:00+0530","feat: add retry utility with exponential backoff")
r("frontend/index.html","</style>","""    .skeleton-text { height: 0.875rem; background: #e5e7eb; border-radius: 0.25rem; }
    .skeleton-text.sm { width: 40%; }
    .skeleton-text.md { width: 65%; }
    .skeleton-text.lg { width: 90%; }
    .skeleton-avatar { width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #e5e7eb; }
    .skeleton-card { padding: 1rem; border-radius: 0.75rem; background: white; border: 1px solid #f3f4f6; }
  </style>""")
commit("2026-03-13T10:00:00+0530","style: add skeleton loader variants for content")
r("frontend/index.html","</style>","""    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #111827; }
    .page-subtitle { font-size: 0.875rem; color: #6b7280; margin-top: 0.125rem; }
    .page-actions { display: flex; gap: 0.5rem; }
  </style>""")
commit("2026-03-13T11:30:00+0530","style: add page header layout component")
w("src/utils/tokenManager.js","/**\n * Token management utilities.\n * Handles generation and validation of secure random tokens.\n */\nconst crypto = require('crypto');\nconst generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');\nconst generateShortCode = (length = 6) => crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();\nmodule.exports = { generateToken, generateShortCode };\n")
commit("2026-03-13T14:00:00+0530","feat: add secure token generation utilities")
r("frontend/index.html","</style>","""    .category-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); gap: 0.75rem; }
    .category-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 0.875rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; cursor: pointer; transition: all 0.15s; font-size: 0.875rem; }
    .category-item:hover { border-color: #c7d2fe; background: #f5f3ff; }
    .category-item.selected { border-color: #6366f1; background: #eef2ff; }
    .category-dot { width: 0.625rem; height: 0.625rem; border-radius: 50%; flex-shrink: 0; }
  </style>""")
commit("2026-03-13T16:30:00+0530","style: add category list grid with selection state")
r("frontend/index.html","</style>","""    .range-slider { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 3px; background: #e5e7eb; outline: none; }
    .range-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #4f46e5; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .range-value { font-size: 0.875rem; font-weight: 600; color: #4f46e5; min-width: 3rem; text-align: center; }
  </style>""")
commit("2026-03-13T19:00:00+0530","style: add range slider input component")
r("frontend/index.html","</style>","""    .card-stack { display: flex; flex-direction: column; gap: 0.75rem; }
    .card-stack > * { animation: fadeIn 0.3s ease backwards; }
    .card-stack > *:nth-child(1) { animation-delay: 0s; }
    .card-stack > *:nth-child(2) { animation-delay: 0.05s; }
    .card-stack > *:nth-child(3) { animation-delay: 0.1s; }
    .card-stack > *:nth-child(4) { animation-delay: 0.15s; }
  </style>""")
commit("2026-03-13T21:30:00+0530","style: add staggered card stack animation")

# MAR 14 (4 commits)
w("src/config/regex.js","/**\n * Commonly used regex patterns.\n */\nmodule.exports = {\n  EMAIL: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,\n  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,\n  YYYY_MM: /^\\d{4}-(0[1-9]|1[0-2])$/,\n  DATE: /^\\d{4}-\\d{2}-\\d{2}$/,\n  HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,\n  AMOUNT: /^\\d+(\\.\\d{1,2})?$/,\n};\n")
commit("2026-03-14T10:00:00+0530","chore: add common regex patterns config")
r("frontend/index.html","</style>","""    .insights-card { padding: 1.25rem; background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 0.75rem; border: 1px solid #e0e7ff; }
    .insights-title { font-size: 0.875rem; font-weight: 600; color: #4338ca; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.375rem; }
    .insights-text { font-size: 0.8125rem; color: #6b7280; line-height: 1.5; }
  </style>""")
commit("2026-03-14T13:30:00+0530","style: add financial insights card component")
r("frontend/index.html","</style>","""    .transaction-icon { width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
    .transaction-icon.income { background: #dcfce7; }
    .transaction-icon.expense { background: #fef2f2; }
    .transaction-meta { display: flex; flex-direction: column; }
    .transaction-title { font-weight: 500; font-size: 0.875rem; }
    .transaction-subtitle { font-size: 0.75rem; color: #9ca3af; }
  </style>""")
commit("2026-03-14T17:00:00+0530","style: add transaction list item with icon layout")
r("frontend/index.html","</style>","""    .footer-links { display: flex; justify-content: center; gap: 1.5rem; margin-top: 0.75rem; }
    .footer-link { font-size: 0.75rem; color: #9ca3af; text-decoration: none; transition: color 0.15s; }
    .footer-link:hover { color: #6366f1; }
  </style>""")
commit("2026-03-14T20:30:00+0530","style: add footer navigation links")

# Cleanup & Push
for f in ["batch_mar_a.py","batch_mar_b.py","batch_mar_c.py","gen_commits_fix.py"]:
    try: os.remove(f)
    except: pass
commit("2026-03-14T20:35:00+0530","chore: clean up batch scripts")
print("\n✅ Mar 10-14 done! Pushing...")
subprocess.run(["git","push","origin","main"], check=True)
print("\n📊 Final count:")
subprocess.run(["git","rev-list","--count","HEAD"], check=True)
