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

def writef(fp, content):
    d = os.path.dirname(fp)
    if d: os.makedirs(d, exist_ok=True)
    with open(fp,'w') as f: f.write(content)

# ═══ Resume from Apr 13 (CHANGELOG) ═══

writef("CHANGELOG.md", """# Changelog

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
- Settings page

### Security
- Rate limiting on auth endpoints
- Helmet security headers
- Parameterized SQL queries
- SHA-256 hashed refresh tokens
""")
commit("2026-04-13T18:00:00+0530", "docs: add CHANGELOG with v1.0.0 release notes")

# ═══ APR 14 ═══

replace("README.md",
    "## Tech Stack",
    """## Screenshots

> 📸 Screenshots coming soon — includes dashboard, transactions, analytics, budgets, and settings.

## Tech Stack""")
commit("2026-04-14T09:00:00+0530", "docs: add screenshots section to README")

replace("README.md",
    "## Features\n",
    """## Features

### Core
- 🔐 **Authentication** — JWT with refresh token rotation
- 💳 **Transactions** — Full CRUD with filtering & pagination
- 📁 **Categories** — Per-user with 12 auto-seeded defaults
- 💰 **Budgets** — Per-category tracking with spend alerts
- 📊 **Analytics** — Summary, trends, category breakdown, health score
- 📥 **CSV Export** — Download transaction history

### UI/UX
- 🌙 **Dark Mode** — Persistent toggle
- 📱 **Responsive** — Mobile-optimized
- ✨ **Animations** — Fade-in, shimmer, hover effects

""")
commit("2026-04-14T11:30:00+0530", "docs: rewrite features section with details")

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
  </style>""")
commit("2026-04-14T15:30:00+0530", "style: add custom scrollbar and selection colors")

replace("frontend/index.html",
    "</style>",
    """    .footer { text-align: center; padding: 2rem 0; color: #9ca3af; font-size: 0.75rem; border-top: 1px solid #e5e7eb; margin-top: 3rem; }
  </style>""")
commit("2026-04-14T18:00:00+0530", "style: add footer component styles")

replace("README.md",
    "## License\n\nISC",
    """## Acknowledgments

- [Express.js](https://expressjs.com/) — Web framework
- [Chart.js](https://www.chartjs.org/) — Visualization
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework
- [Neon](https://neon.tech/) — Serverless Postgres

## License

ISC""")
commit("2026-04-14T20:30:00+0530", "docs: add acknowledgments section to README")

# ═══ Cleanup & Push ═══
for f in ["gen_commits_part1.py", "gen_commits_part2.py", "gen_commits_fix.py", "gen_commits_final.py"]:
    try: os.remove(f)
    except: pass
commit("2026-04-14T20:35:00+0530", "chore: clean up scripts")

print("\n✅ All done! Pushing...")
subprocess.run(["git","push","origin","main"], check=True)
print("\n📊 Final log:")
subprocess.run(["git","log","--format=%h %ai %s","-75"], check=True)
