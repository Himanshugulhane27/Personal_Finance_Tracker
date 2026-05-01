/**
 * Analytics service — summary, category breakdown, trends, health score.
 */
const db = require('../db/pool');
const { parseMonth, clamp, round } = require('../utils/helpers');

/* ────────────────────────────────────────────────────────
 * GET /analytics/summary?month=YYYY-MM
 *
 * Response:
 * {
 *   month: "2026-04",
 *   total_income:  5000.00,
 *   total_expense: 3200.00,
 *   net_savings:   1800.00,
 *   savings_rate:  36.00       // percentage
 * }
 * ──────────────────────────────────────────────────────── */
const getSummary = async (userId, month) => {
  const { start, end } = parseMonth(month);

  const { rows } = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
     FROM transactions
     WHERE user_id = $1
       AND date >= $2
       AND date <  $3`,
    [userId, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  );

  const totalIncome  = parseFloat(rows[0].total_income);
  const totalExpense = parseFloat(rows[0].total_expense);
  const netSavings   = round(totalIncome - totalExpense);
  const savingsRate  = totalIncome > 0
    ? round((netSavings / totalIncome) * 100)
    : 0;

  return {
    month,
    total_income:  round(totalIncome),
    total_expense: round(totalExpense),
    net_savings:   netSavings,
    savings_rate:  savingsRate,
  };
};

/* ────────────────────────────────────────────────────────
 * GET /analytics/category-breakdown?month=YYYY-MM
 *
 * Response: [
 *   {
 *     category_id, category_name, color, icon,
 *     amount, percentage_of_total,
 *     previous_month_amount, change_percentage
 *   }, …
 * ]
 * ──────────────────────────────────────────────────────── */
const getCategoryBreakdown = async (userId, month) => {
  const { start: curStart, end: curEnd } = parseMonth(month);

  // Compute previous month boundaries
  const prevDate  = new Date(curStart);
  prevDate.setUTCMonth(prevDate.getUTCMonth() - 1);
  const prevMonth = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`;
  const { start: prevStart, end: prevEnd } = parseMonth(prevMonth);

  // Current month per-category expense totals
  const { rows: current } = await db.query(
    `SELECT
       c.id AS category_id,
       c.name AS category_name,
       c.color,
       c.icon,
       COALESCE(SUM(t.amount), 0) AS amount
     FROM categories c
     LEFT JOIN transactions t
       ON t.category_id = c.id
       AND t.type = 'expense'
       AND t.date >= $2
       AND t.date <  $3
     WHERE c.user_id = $1
     GROUP BY c.id, c.name, c.color, c.icon
     HAVING COALESCE(SUM(t.amount), 0) > 0
     ORDER BY amount DESC`,
    [userId, curStart.toISOString().slice(0, 10), curEnd.toISOString().slice(0, 10)]
  );

  // Previous month totals (for comparison)
  const { rows: previous } = await db.query(
    `SELECT
       c.id AS category_id,
       COALESCE(SUM(t.amount), 0) AS amount
     FROM categories c
     LEFT JOIN transactions t
       ON t.category_id = c.id
       AND t.type = 'expense'
       AND t.date >= $2
       AND t.date <  $3
     WHERE c.user_id = $1
     GROUP BY c.id`,
    [userId, prevStart.toISOString().slice(0, 10), prevEnd.toISOString().slice(0, 10)]
  );

  const prevMap = new Map(previous.map((r) => [r.category_id, parseFloat(r.amount)]));

  const totalExpense = current.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  return current.map((row) => {
    const amount    = parseFloat(row.amount);
    const prevAmt   = prevMap.get(row.category_id) || 0;
    const changePct = prevAmt > 0
      ? round(((amount - prevAmt) / prevAmt) * 100)
      : amount > 0 ? 100 : 0;

    return {
      category_id:           row.category_id,
      category_name:         row.category_name,
      color:                 row.color,
      icon:                  row.icon,
      amount:                round(amount),
      percentage_of_total:   totalExpense > 0 ? round((amount / totalExpense) * 100) : 0,
      previous_month_amount: round(prevAmt),
      change_percentage:     changePct,
    };
  });
};

/* ────────────────────────────────────────────────────────
 * GET /analytics/trends?months=6
 *
 * Response: [
 *   { month: "2025-11", income: 5000, expense: 3200, net: 1800 },
 *   …
 * ]
 * ──────────────────────────────────────────────────────── */
const getTrends = async (userId, months = 6) => {
  const safeMonths = clamp(Number(months) || 6, 1, 24);

  // Calculate start date (N months ago from start of current month)
  const now   = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - safeMonths + 1, 1));

  const { rows } = await db.query(
    `SELECT
       TO_CHAR(date, 'YYYY-MM') AS month,
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
     FROM transactions
     WHERE user_id = $1
       AND date >= $2
     GROUP BY TO_CHAR(date, 'YYYY-MM')
     ORDER BY month ASC`,
    [userId, start.toISOString().slice(0, 10)]
  );

  // Fill in missing months with zeros
  const result = [];
  for (let i = 0; i < safeMonths; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const match = rows.find((r) => r.month === key);
    const income  = match ? parseFloat(match.income)  : 0;
    const expense = match ? parseFloat(match.expense) : 0;
    result.push({
      month:   key,
      income:  round(income),
      expense: round(expense),
      net:     round(income - expense),
    });
  }

  return result;
};

/* ────────────────────────────────────────────────────────
 * GET /analytics/health-score
 *
 * Scoring algorithm (0–100):
 *   Savings rate     → 40 pts  (based on last 3 months avg savings rate)
 *   Budget adherence → 35 pts  (% of active budgets under limit)
 *   Consistency      → 25 pts  (std-dev of monthly savings over 6 months)
 *
 * Response:
 * {
 *   score: 72,
 *   breakdown: { savings_rate: { score, details }, … },
 *   grade: "B"
 * }
 * ──────────────────────────────────────────────────────── */
const getHealthScore = async (userId) => {
  const now = new Date();

  // ── 1. Savings rate (last 3 months) → max 40 pts ──────
  const threeMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1));
  const { rows: savingsRows } = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
     FROM transactions
     WHERE user_id = $1 AND date >= $2`,
    [userId, threeMonthsAgo.toISOString().slice(0, 10)]
  );

  const income3  = parseFloat(savingsRows[0].income);
  const expense3 = parseFloat(savingsRows[0].expense);
  const avgSavingsRate = income3 > 0
    ? ((income3 - expense3) / income3) * 100
    : 0;

  // Scale: 20%+ savings = full 40 pts, linearly scaled below
  const savingsScore = round(clamp((avgSavingsRate / 20) * 40, 0, 40));

  // ── 2. Budget adherence → max 35 pts ──────────────────
  const { rows: budgets } = await db.query(
    'SELECT id, category_id, amount_limit, period FROM budgets WHERE user_id = $1',
    [userId]
  );

  let adherenceScore = 35; // full score if no budgets set
  if (budgets.length > 0) {
    let underBudget = 0;
    for (const b of budgets) {
      // Calculate current period bounds
      let periodStart, periodEnd;
      if (b.period === 'monthly') {
        periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        periodEnd   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
      } else {
        const day  = now.getUTCDay();
        const diff = day === 0 ? 6 : day - 1;
        periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
        periodEnd   = new Date(periodStart.getTime() + 6 * 86400000);
      }

      const { rows: spendRows } = await db.query(
        `SELECT COALESCE(SUM(amount), 0) AS spend
         FROM transactions
         WHERE user_id = $1 AND category_id = $2 AND type = 'expense'
           AND date >= $3 AND date <= $4`,
        [userId, b.category_id, periodStart.toISOString().slice(0, 10), periodEnd.toISOString().slice(0, 10)]
      );

      if (parseFloat(spendRows[0].spend) <= parseFloat(b.amount_limit)) {
        underBudget++;
      }
    }

    adherenceScore = round((underBudget / budgets.length) * 35);
  }

  // ── 3. Consistency (6 months) → max 25 pts ────────────
  const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const { rows: monthlyRows } = await db.query(
    `SELECT
       TO_CHAR(date, 'YYYY-MM') AS month,
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
     FROM transactions
     WHERE user_id = $1 AND date >= $2
     GROUP BY TO_CHAR(date, 'YYYY-MM')
     ORDER BY month`,
    [userId, sixMonthsAgo.toISOString().slice(0, 10)]
  );

  let consistencyScore = 25;
  if (monthlyRows.length >= 2) {
    const savingsRates = monthlyRows.map((r) => {
      const inc = parseFloat(r.income);
      const exp = parseFloat(r.expense);
      return inc > 0 ? ((inc - exp) / inc) * 100 : 0;
    });

    const mean   = savingsRates.reduce((a, b) => a + b, 0) / savingsRates.length;
    const stdDev = Math.sqrt(
      savingsRates.reduce((sum, v) => sum + (v - mean) ** 2, 0) / savingsRates.length
    );

    // Lower std-dev = more consistent = higher score
    // stdDev < 5 = perfect, stdDev > 30 = zero
    consistencyScore = round(clamp(((30 - stdDev) / 25) * 25, 0, 25));
  }

  const totalScore = Math.round(clamp(savingsScore + adherenceScore + consistencyScore, 0, 100));

  // Grade mapping
  const grade =
    totalScore >= 90 ? 'A+' :
    totalScore >= 80 ? 'A'  :
    totalScore >= 70 ? 'B'  :
    totalScore >= 60 ? 'C'  :
    totalScore >= 50 ? 'D'  :
    'F';

  return {
    score: totalScore,
    grade,
    breakdown: {
      savings_rate: {
        score:   round(savingsScore),
        max:     40,
        details: `Average savings rate: ${round(avgSavingsRate)}% over last 3 months`,
      },
      budget_adherence: {
        score:   round(adherenceScore),
        max:     35,
        details: budgets.length > 0
          ? `${budgets.length} active budget(s) evaluated`
          : 'No budgets set — full score by default',
      },
      consistency: {
        score:   round(consistencyScore),
        max:     25,
        details: monthlyRows.length >= 2
          ? `Evaluated over ${monthlyRows.length} months of data`
          : 'Insufficient data — full score by default',
      },
    },
  };
};

module.exports = { getSummary, getCategoryBreakdown, getTrends, getHealthScore };
