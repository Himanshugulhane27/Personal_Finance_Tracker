/**
 * Budget service — CRUD with live spend calculation and warning flags.
 */
const db       = require('../db/pool');
const AppError = require('../utils/AppError');

/* ────────────────────────────────────────────────────────
 * Helpers — compute current period boundaries
 * ──────────────────────────────────────────────────────── */

/**
 * Determine the current budget period boundaries.
 * For 'monthly': first and last day of the current month.
 * For 'weekly':  Monday–Sunday of the current week.
 */
const getCurrentPeriodBounds = (period) => {
  const now = new Date();

  if (period === 'monthly') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)); // last day
    return { periodStart: start, periodEnd: end };
  }

  // weekly — Monday to Sunday
  const day   = now.getUTCDay(); // 0=Sun, 1=Mon, …
  const diff  = day === 0 ? 6 : day - 1; // days since Monday
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  const end   = new Date(start.getTime() + 6 * 86400000); // +6 days
  return { periodStart: start, periodEnd: end };
};

/* ────────────────────────────────────────────────────────
 * Public API
 * ──────────────────────────────────────────────────────── */

/**
 * Create a budget for a specific category+period (unique per user).
 */
const create = async (userId, data) => {
  const { category_id, amount_limit, period, start_date, end_date } = data;

  // Verify category belongs to user and is expense type
  const cat = await db.query(
    'SELECT id, type FROM categories WHERE id = $1 AND user_id = $2',
    [category_id, userId]
  );
  if (cat.rows.length === 0) {
    throw AppError.badRequest('Category not found or does not belong to you');
  }
  if (cat.rows[0].type !== 'expense') {
    throw AppError.badRequest('Budgets can only be set for expense categories');
  }

  const { rows } = await db.query(
    `INSERT INTO budgets (user_id, category_id, amount_limit, period, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, category_id, amount_limit, period, start_date, end_date || null]
  );

  return rows[0];
};

/**
 * List all budgets for the user with live spend tracking.
 *
 * Each budget includes:
 *   - current_spend      — total expense in the current period
 *   - spend_percentage   — current_spend / amount_limit * 100
 *   - remaining          — amount_limit - current_spend
 *   - warning            — true when spend >= 80% of limit
 */
const list = async (userId) => {
  const { rows: budgets } = await db.query(
    `SELECT b.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );

  // Enrich each budget with live spend data
  const enriched = await Promise.all(
    budgets.map(async (budget) => {
      const { periodStart, periodEnd } = getCurrentPeriodBounds(budget.period);

      const spendResult = await db.query(
        `SELECT COALESCE(SUM(amount), 0) AS current_spend
         FROM transactions
         WHERE user_id = $1
           AND category_id = $2
           AND type = 'expense'
           AND date >= $3
           AND date <= $4`,
        [userId, budget.category_id, periodStart.toISOString().slice(0, 10), periodEnd.toISOString().slice(0, 10)]
      );

      const currentSpend    = parseFloat(spendResult.rows[0].current_spend);
      const limit           = parseFloat(budget.amount_limit);
      const spendPercentage = limit > 0 ? Math.round((currentSpend / limit) * 10000) / 100 : 0;
      const remaining       = Math.max(limit - currentSpend, 0);
      const warning         = spendPercentage >= 80;

      return {
        ...budget,
        period_start:     periodStart.toISOString().slice(0, 10),
        period_end:       periodEnd.toISOString().slice(0, 10),
        current_spend:    currentSpend,
        spend_percentage: spendPercentage,
        remaining:        Math.round(remaining * 100) / 100,
        warning,
      };
    })
  );

  return enriched;
};

/**
 * Get a single budget by id (scoped to user), with live spend.
 */
const getById = async (userId, budgetId) => {
  const { rows } = await db.query(
    `SELECT b.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     WHERE b.id = $1 AND b.user_id = $2`,
    [budgetId, userId]
  );
  if (rows.length === 0) throw AppError.notFound('Budget not found');

  const budget = rows[0];
  const { periodStart, periodEnd } = getCurrentPeriodBounds(budget.period);

  const spendResult = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS current_spend
     FROM transactions
     WHERE user_id = $1
       AND category_id = $2
       AND type = 'expense'
       AND date >= $3
       AND date <= $4`,
    [userId, budget.category_id, periodStart.toISOString().slice(0, 10), periodEnd.toISOString().slice(0, 10)]
  );

  const currentSpend    = parseFloat(spendResult.rows[0].current_spend);
  const limit           = parseFloat(budget.amount_limit);
  const spendPercentage = limit > 0 ? Math.round((currentSpend / limit) * 10000) / 100 : 0;
  const remaining       = Math.max(limit - currentSpend, 0);

  return {
    ...budget,
    period_start:     periodStart.toISOString().slice(0, 10),
    period_end:       periodEnd.toISOString().slice(0, 10),
    current_spend:    currentSpend,
    spend_percentage: spendPercentage,
    remaining:        Math.round(remaining * 100) / 100,
    warning:          spendPercentage >= 80,
  };
};

/**
 * Update a budget.
 */
const update = async (userId, budgetId, updates) => {
  const allowedFields = ['category_id', 'amount_limit', 'period', 'start_date', 'end_date'];
  const setClauses = [];
  const params     = [];
  let paramIdx     = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = $${paramIdx}`);
      params.push(updates[field]);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) {
    throw AppError.badRequest('No valid fields to update');
  }

  params.push(budgetId, userId);

  const { rows } = await db.query(
    `UPDATE budgets
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIdx} AND user_id = $${paramIdx + 1}
     RETURNING *`,
    params
  );

  if (rows.length === 0) throw AppError.notFound('Budget not found');
  return rows[0];
};

/**
 * Delete a budget.
 */
const remove = async (userId, budgetId) => {
  const { rowCount } = await db.query(
    'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
    [budgetId, userId]
  );
  if (rowCount === 0) throw AppError.notFound('Budget not found');
};

module.exports = { create, list, getById, update, remove };
