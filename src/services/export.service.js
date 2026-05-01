/**
 * Export service — CSV download of transactions.
 */
const { stringify } = require('csv-stringify/sync');
const db = require('../db/pool');

/**
 * Export transactions as CSV string.
 *
 * @param {string} userId
 * @param {{ start_date?: string, end_date?: string }} filters
 * @returns {string} CSV content
 */
const exportTransactionsCsv = async (userId, { start_date, end_date } = {}) => {
  const conditions = ['t.user_id = $1'];
  const params     = [userId];
  let paramIdx     = 2;

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

  const { rows } = await db.query(
    `SELECT
       t.id,
       t.date,
       t.type,
       c.name AS category,
       t.amount,
       t.description,
       t.is_recurring,
       t.recurrence_rule,
       t.created_at
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY t.date DESC, t.created_at DESC`,
    params
  );

  if (rows.length === 0) {
    return stringify([], {
      header: true,
      columns: ['id', 'date', 'type', 'category', 'amount', 'description', 'is_recurring', 'recurrence_rule', 'created_at'],
    });
  }

  return stringify(rows, {
    header: true,
    columns: [
      { key: 'id',              header: 'Transaction ID' },
      { key: 'date',            header: 'Date' },
      { key: 'type',            header: 'Type' },
      { key: 'category',        header: 'Category' },
      { key: 'amount',          header: 'Amount' },
      { key: 'description',     header: 'Description' },
      { key: 'is_recurring',    header: 'Recurring' },
      { key: 'recurrence_rule', header: 'Recurrence Rule' },
      { key: 'created_at',      header: 'Created At' },
    ],
  });
};

module.exports = { exportTransactionsCsv };
