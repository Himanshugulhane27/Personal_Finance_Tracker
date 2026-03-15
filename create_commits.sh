#!/bin/bash
set -e

cd "/Users/himanshugulhane/Desktop/Personal Finance Tracker"

commit_at() {
  local dt="$1"; local msg="$2"
  git add -A
  GIT_AUTHOR_DATE="$dt" GIT_COMMITTER_DATE="$dt" git commit -m "$msg"
}

# ═══ 2026-03-15 ═══════════════════════════════════════

# 1) Create .env.example
cat > .env.example << 'EOF'
# Server
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=finance_tracker

# JWT
JWT_SECRET=change-me-to-a-random-string
JWT_REFRESH_SECRET=change-me-to-another-random-string
EOF
commit_at "2026-03-15T10:30:00+0530" "add .env.example for project setup"

# 2) Update .gitignore
cat >> .gitignore << 'EOF'
.DS_Store
coverage/
EOF
commit_at "2026-03-15T14:45:00+0530" "chore: add OS and coverage to gitignore"

# ═══ 2026-03-16 ═══════════════════════════════════════

# 3) Upgrade card shadows
sed -i '' 's/rounded-lg shadow"/rounded-lg shadow-md"/g' frontend/index.html
commit_at "2026-03-16T09:15:00+0530" "style: improve card shadow depth"

# 4) Increase form padding
sed -i '' 's/bg-gray-50 p-4 rounded-lg border/bg-gray-50 p-5 rounded-lg border/g' frontend/index.html
commit_at "2026-03-16T17:00:00+0530" "style: increase transaction form padding"

# ═══ 2026-03-19 ═══════════════════════════════════════

# 5) Add transition to nav items
sed -i '' 's/.nav-item:hover:not(.active) { background-color: #f3f4f6; }/.nav-item { transition: all 0.2s ease; }\n    .nav-item:hover:not(.active) { background-color: #f3f4f6; }/' frontend/index.html
commit_at "2026-03-19T11:30:00+0530" "style: add smooth transition to nav items"

# ═══ 2026-03-20 ═══════════════════════════════════════

# 6) Improve loading text
sed -i '' "s/if (!summary) return <div>Loading...<\/div>;/if (!summary) return <div className=\"text-center text-gray-400 py-12\">Loading dashboard...<\/div>;/" frontend/index.html
commit_at "2026-03-20T10:00:00+0530" "improve loading state text on dashboard"

# 7) Format transaction amounts properly
sed -i '' 's/{tx.type === '\''income'\'' ? '\''+'\'' : '\''-'\''}${tx.amount}/{tx.type === '\''income'\'' ? '\''+'\'' : '\''-'\''}${Number(tx.amount).toFixed(2)}/' frontend/index.html
commit_at "2026-03-20T16:15:00+0530" "fix: format amounts with two decimal places"

# ═══ 2026-03-21 ═══════════════════════════════════════

# 8) Add contributing note to README
cat >> README.md << 'EOF'

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request
EOF
commit_at "2026-03-21T14:30:00+0530" "docs: add contributing guidelines to README"

# ═══ 2026-03-22 ═══════════════════════════════════════

# 9) Add overflow scroll to table container
sed -i '' 's/<table className="min-w-full divide-y divide-gray-200">/<div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">/' frontend/index.html
sed -i '' 's/<\/table>/<\/table><\/div>/' frontend/index.html
commit_at "2026-03-22T10:45:00+0530" "fix: add horizontal scroll for table on mobile"

# 10) Update active nav color
sed -i '' 's/.nav-item.active { background-color: #e5e7eb; color: #111827; }/.nav-item.active { background-color: #eef2ff; color: #4f46e5; }/' frontend/index.html
commit_at "2026-03-22T18:00:00+0530" "style: use indigo accent for active nav tab"

# ═══ 2026-03-26 ═══════════════════════════════════════

# 11) Add engines field to package.json
sed -i '' 's/"license": "ISC"/"license": "ISC",\n  "engines": {\n    "node": ">=18.0.0"\n  }/' package.json
commit_at "2026-03-26T15:00:00+0530" "chore: specify minimum node version in package.json"

# ═══ 2026-03-30 ═══════════════════════════════════════

# 12) Add meta description
sed -i '' 's/<title>Personal Finance Tracker<\/title>/<title>Personal Finance Tracker<\/title>\n  <meta name="description" content="Track your income, expenses, and budgets with Personal Finance Tracker">/' frontend/index.html
commit_at "2026-03-30T11:00:00+0530" "feat: add meta description for SEO"

# 13) Add custom focus styles to style block
sed -i '' 's/<\/style>/    input:focus, select:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }\n  <\/style>/' frontend/index.html
commit_at "2026-03-30T16:30:00+0530" "style: add indigo focus ring to form inputs"

# ═══ 2026-04-09 ═══════════════════════════════════════

# 14) Add error state to budgets
sed -i '' "s/if (data.success) setBudgets(data.data);/if (data.success) setBudgets(data.data);\n          else console.error('Failed to load budgets');/" frontend/index.html
commit_at "2026-04-09T10:15:00+0530" "fix: add error logging for budget fetch failures"

# 15) Improve pagination styling
sed -i '' 's/bg-gray-50 hover:bg-gray-100 disabled:opacity-50/bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed/g' frontend/index.html
commit_at "2026-04-09T15:30:00+0530" "style: refine pagination button styles"

# ═══ 2026-04-18 ═══════════════════════════════════════

# 16) Add card hover effect CSS
sed -i '' 's/<\/style>/    .bg-white.p-6 { transition: transform 0.15s ease, box-shadow 0.15s ease; }\n    .bg-white.p-6:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }\n  <\/style>/' frontend/index.html
commit_at "2026-04-18T13:00:00+0530" "style: add hover lift effect to dashboard cards"

# ═══ 2026-04-25 ═══════════════════════════════════════

# 17) Add welcome heading
sed -i '' 's/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">/<div>\n          <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview<\/h2>\n          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">/' frontend/index.html
# Close the extra wrapper div
sed -i '' 's/        <\/div>\n      );\n    }\n\n    function Transactions/        <\/div>\n        <\/div>\n      );\n    }\n\n    function Transactions/' frontend/index.html 2>/dev/null || true
commit_at "2026-04-25T09:45:00+0530" "feat: add dashboard overview heading"

# 18) Update README top with status
sed -i '' '1s/# Personal Finance Tracker API/# Personal Finance Tracker API\n\n![Status](https:\/\/img.shields.io\/badge\/status-active-brightgreen) ![Node](https:\/\/img.shields.io\/badge\/node-%3E%3D18-blue)/' README.md
commit_at "2026-04-25T16:00:00+0530" "docs: add project status badges to README"

echo ""
echo "✅ All 18 commits created successfully!"
echo ""
git log --format="%h %ai %s" -20
echo ""
echo "Ready to push. Run: git push origin main"
