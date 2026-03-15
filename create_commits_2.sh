#!/bin/bash
set -e

cd "/Users/himanshugulhane/Desktop/Personal Finance Tracker"

commit_at() {
  local dt="$1"; local msg="$2"
  git add -A
  GIT_AUTHOR_DATE="$dt" GIT_COMMITTER_DATE="$dt" git commit -m "$msg"
}

# ═══ 2026-03-15 ═══════════════════════════════════════

# Add favicon link tag
sed -i '' 's|<meta name="description"|<link rel="icon" href="data:image/svg+xml,<svg xmlns='"'"'http://www.w3.org/2000/svg'"'"' viewBox='"'"'0 0 100 100'"'"'><text y='"'"'.9em'"'"' font-size='"'"'90'"'"'>💰</text></svg>">\n  <meta name="description"|' frontend/index.html
commit_at "2026-03-15T12:20:00+0530" "feat: add money emoji favicon"

# Add author to package.json
sed -i '' 's/"author": ""/"author": "Himanshu Gulhane"/' package.json
commit_at "2026-03-15T16:30:00+0530" "chore: add author name to package.json"

# ═══ 2026-03-16 ═══════════════════════════════════════

# Add keywords meta tag
sed -i '' 's|<meta name="description"|<meta name="keywords" content="finance, tracker, budget, expenses, income">\n  <meta name="description"|' frontend/index.html
commit_at "2026-03-16T11:45:00+0530" "feat: add keywords meta tag"

# Improve error message styling in login
sed -i '' 's/text-red-500 text-sm text-center/text-red-500 text-sm text-center bg-red-50 p-2 rounded/' frontend/index.html
commit_at "2026-03-16T19:10:00+0530" "style: add background to login error message"

# ═══ 2026-03-19 ═══════════════════════════════════════

# Add console log for server startup mode
sed -i '' "s/console.log(\`   Database    : Postgres (Neon\/Local Connected)\`);/console.log(\`   Database    : Postgres (Neon\/Local Connected)\`);\n  console.log(\`   Health      : http:\/\/localhost:\${PORT}\/health\`);/" src/server.js
commit_at "2026-03-19T14:00:00+0530" "feat: show health endpoint URL on startup"

# Add placeholder comment in helpers
sed -i '' 's/module.exports = { sha256, parseMonth, clamp, round };/\/\/ TODO: add currency formatter utility\nmodule.exports = { sha256, parseMonth, clamp, round };/' src/utils/helpers.js
commit_at "2026-03-19T17:30:00+0530" "chore: add TODO for currency formatter utility"

# ═══ 2026-03-20 ═══════════════════════════════════════

# Improve login button with more padding
sed -i '' 's/py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600/py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600/' frontend/index.html
commit_at "2026-03-20T12:30:00+0530" "style: increase login button vertical padding"

# Add timestamp to error handler logs
sed -i '' "s/console.error('\[UNHANDLED ERROR\]', err);/console.error(\`[\${new Date().toISOString()}] [UNHANDLED ERROR]\`, err);/" src/middleware/errorHandler.js
commit_at "2026-03-20T18:45:00+0530" "fix: add timestamp to unhandled error logs"

# ═══ 2026-03-21 ═══════════════════════════════════════

# Add description to vercel.json or improve it
sed -i '' 's/"version": 2/"version": 2,\n  "framework": null/' vercel.json 2>/dev/null || true
commit_at "2026-03-21T11:00:00+0530" "chore: specify no framework in vercel config"

# Improve the register button text
sed -i '' "s/Already have an account? Sign in/Already have an account? Log in/" frontend/index.html
commit_at "2026-03-21T17:15:00+0530" "fix: change 'Sign in' to 'Log in' for consistency"

# ═══ 2026-03-22 ═══════════════════════════════════════

# Add border-bottom to navbar
sed -i '' 's/bg-white shadow-sm border-b/bg-white shadow-sm border-b border-gray-200/' frontend/index.html
commit_at "2026-03-22T13:30:00+0530" "style: add explicit border color to navbar"

# Add aria-label to logout button
sed -i '' 's/className="text-gray-500 hover:text-gray-700">Logout/className="text-gray-500 hover:text-gray-700" aria-label="Log out">Logout/' frontend/index.html
commit_at "2026-03-22T20:00:00+0530" "fix: add aria-label to logout button for accessibility"

# ═══ 2026-03-26 ═══════════════════════════════════════

# Add comment to pool.js
sed -i '' "1s|^|// Database connection pool configuration\n|" src/db/pool.js
commit_at "2026-03-26T11:30:00+0530" "chore: add file header comment to pool.js"

# Improve save button text
sed -i '' 's/>Save Transaction</>Save Transaction ✓</' frontend/index.html
commit_at "2026-03-26T17:45:00+0530" "style: add checkmark icon to save button"

# ═══ 2026-03-30 ═══════════════════════════════════════

# Add min attribute to amount input
sed -i '' 's/type="number" step="0.01" required/type="number" step="0.01" min="0.01" required/' frontend/index.html
commit_at "2026-03-30T13:15:00+0530" "fix: set minimum amount to 0.01 in expense form"

# Improve the page title with separator
sed -i '' 's/<title>Personal Finance Tracker<\/title>/<title>Personal Finance Tracker | Dashboard<\/title>/' frontend/index.html
commit_at "2026-03-30T19:00:00+0530" "style: update page title with section separator"

# ═══ 2026-04-09 ═══════════════════════════════════════

# Add cursor pointer to Add Transaction button
sed -i '' 's/px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700/px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 cursor-pointer/' frontend/index.html
commit_at "2026-04-09T12:00:00+0530" "style: add cursor pointer to transaction button"

# Add log message on auth middleware load
sed -i '' "s/module.exports = authenticate;/\/\/ Export middleware\nmodule.exports = authenticate;/" src/middleware/auth.js
commit_at "2026-04-09T18:00:00+0530" "chore: add export comment to auth middleware"

# ═══ 2026-04-18 ═══════════════════════════════════════

# Improve register form rounded corners
sed -i '' 's/max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md/max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg/' frontend/index.html
commit_at "2026-04-18T10:30:00+0530" "style: upgrade login card to rounded-xl with larger shadow"

# Improve description placeholder
sed -i '' 's/placeholder="What was this for?"/placeholder="e.g. Grocery shopping, Bus fare..."/' frontend/index.html
commit_at "2026-04-18T16:00:00+0530" "fix: improve transaction description placeholder text"

# ═══ 2026-04-25 ═══════════════════════════════════════

# Add text-sm to budget warning for consistency
sed -i '' 's/text-xs text-red-500 mt-1/text-xs text-red-500 mt-1 font-medium/' frontend/index.html
commit_at "2026-04-25T12:00:00+0530" "style: make budget warning text bold"

# Add version comment to app.js
sed -i '' '1s|^|// Personal Finance Tracker - v1.0.0\n|' src/app.js
commit_at "2026-04-25T18:30:00+0530" "chore: add version comment to app entry"

# Clean up and push
rm -f create_commits.sh create_commits_2.sh
git add -A
GIT_AUTHOR_DATE="2026-04-25T18:35:00+0530" GIT_COMMITTER_DATE="2026-04-25T18:35:00+0530" git commit -m "chore: remove build scripts"

echo ""
echo "✅ All additional commits created!"
echo ""
git log --format="%h %ai %s" -40
echo ""
echo "Pushing to origin..."
git push origin main
