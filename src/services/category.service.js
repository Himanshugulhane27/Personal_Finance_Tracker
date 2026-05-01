/**
 * Category service — CRUD for per-user categories.
 */
const db       = require('../db/pool');
const AppError = require('../utils/AppError');

/**
 * Create a new category for the authenticated user.
 */
const create = async (userId, { name, type, color, icon }) => {
  const { rows } = await db.query(
    `INSERT INTO categories (user_id, name, type, color, icon)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, name, type, color || '#6B7280', icon || 'tag']
  );
  return rows[0];
};

/**
 * List all categories for the authenticated user.
 * Optionally filter by type (income | expense).
 */
const list = async (userId, { type } = {}) => {
  let sql = 'SELECT * FROM categories WHERE user_id = $1';
  const params = [userId];

  if (type) {
    sql += ' AND type = $2';
    params.push(type);
  }

  sql += ' ORDER BY type ASC, name ASC';

  const { rows } = await db.query(sql, params);
  return rows;
};

/**
 * Get a single category by id (scoped to user).
 */
const getById = async (userId, categoryId) => {
  const { rows } = await db.query(
    'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
    [categoryId, userId]
  );
  if (rows.length === 0) throw AppError.notFound('Category not found');
  return rows[0];
};

/**
 * Update a category (partial update supported).
 */
const update = async (userId, categoryId, updates) => {
  // Build SET clause dynamically from provided fields
  const allowedFields = ['name', 'type', 'color', 'icon'];
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

  params.push(categoryId, userId);

  const { rows } = await db.query(
    `UPDATE categories
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIdx} AND user_id = $${paramIdx + 1}
     RETURNING *`,
    params
  );

  if (rows.length === 0) throw AppError.notFound('Category not found');
  return rows[0];
};

/**
 * Delete a category.
 * Will fail if there are transactions referencing it (ON DELETE RESTRICT).
 */
const remove = async (userId, categoryId) => {
  const { rowCount } = await db.query(
    'DELETE FROM categories WHERE id = $1 AND user_id = $2',
    [categoryId, userId]
  );
  if (rowCount === 0) throw AppError.notFound('Category not found');
};

module.exports = { create, list, getById, update, remove };
