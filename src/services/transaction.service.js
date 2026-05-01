/**
 * Transaction service — CRUD with filtering and pagination.
 */
const db       = require('../db/pool');
const AppError = require('../utils/AppError');

/**
 * Create a new transaction.
 */
const create = async (userId, data) => {
  const {
    category_id,
    amount,
    type,
    description,
    date,
    is_recurring,
    recurrence_rule,
    parent_id,
  } = data;

  // Verify category belongs to user
  const cat = await db.query(
    'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
    [category_id, userId]
  );
  if (cat.rows.length === 0) {
    throw AppError.badRequest('Category not found or does not belong to you');
  }

  const { rows } = await db.query(
    `INSERT INTO transactions
       (user_id, category_id, amount, type, description, date,
        is_recurring, recurrence_rule, parent_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      userId,
      category_id,
      amount,
      type,
      description || null,
      date || new Date().toISOString().slice(0, 10),
      is_recurring || false,
      is_recurring ? recurrence_rule : null,
      parent_id || null,
    ]
  );
  return rows[0];
};

/**
 * List transactions with filtering and pagination.
 *
 * Filters: type, category_id, start_date, end_date
 * Pagination: page (1-based), limit (default 20, max 100)
 */
const list = async (userId, filters = {}) => {
  const {
    type,
    category_id,
    start_date,
    end_date,
    page  = 1,
    limit = 20,
  } = filters;

  const safeLimit  = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage   = Math.max(Number(page) || 1, 1);
  const offset     = (safePage - 1) * safeLimit;

  const conditions = ['t.user_id = $1'];
  const params     = [userId];
  let paramIdx     = 2;

  if (type) {
    conditions.push(`t.type = $${paramIdx}`);
    params.push(type);
    paramIdx++;
  }
  if (category_id) {
    conditions.push(`t.category_id = $${paramIdx}`);
    params.push(category_id);
    paramIdx++;
  }
  if (start_date) {
    conditions.push(`t.date >= $${paramIdx}`);
    params.push(start_date);
    paramIdx++;
  }
  if (end_date) {
    conditions.push(`t.date <= $${paramIdx}`);
    params.push(end_date);
    paramIdx++;
  }

  const whereClause = conditions.join(' AND ');

  // Count total matching rows
  const countResult = await db.query(
    `SELECT COUNT(*) FROM transactions t WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Fetch page
  const { rows } = await db.query(
    `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${whereClause}
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, safeLimit, offset]
  );

  return {
    data: rows,
    pagination: {
      page:        safePage,
      limit:       safeLimit,
      total,
      total_pages: Math.ceil(total / safeLimit),
    },
  };
};

/**
 * Get a single transaction by id (scoped to user).
 */
const getById = async (userId, transactionId) => {
  const { rows } = await db.query(
    `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1 AND t.user_id = $2`,
    [transactionId, userId]
  );
  if (rows.length === 0) throw AppError.notFound('Transaction not found');
  return rows[0];
};

/**
 * Update a transaction (partial update).
 */
const update = async (userId, transactionId, updates) => {
  // If category_id is being changed, verify it belongs to user
  if (updates.category_id) {
    const cat = await db.query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [updates.category_id, userId]
    );
    if (cat.rows.length === 0) {
      throw AppError.badRequest('Category not found or does not belong to you');
    }
  }

  const allowedFields = [
    'category_id', 'amount', 'type', 'description', 'date',
    'is_recurring', 'recurrence_rule',
  ];
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

  params.push(transactionId, userId);

  const { rows } = await db.query(
    `UPDATE transactions
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIdx} AND user_id = $${paramIdx + 1}
     RETURNING *`,
    params
  );

  if (rows.length === 0) throw AppError.notFound('Transaction not found');
  return rows[0];
};

/**
 * Delete a transaction (scoped to user).
 */
const remove = async (userId, transactionId) => {
  const { rowCount } = await db.query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
    [transactionId, userId]
  );
  if (rowCount === 0) throw AppError.notFound('Transaction not found');
};

module.exports = { create, list, getById, update, remove };
