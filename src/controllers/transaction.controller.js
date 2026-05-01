/**
 * Transaction controller.
 *
 * POST /transactions
 *   Body: { "category_id": "uuid", "amount": 150.00, "type": "expense", "description": "Groceries", "date": "2026-04-30" }
 *   201: { "success": true, "data": { id, user_id, category_id, amount, type, description, date, … } }
 *
 * GET /transactions?type=expense&category_id=uuid&start_date=2026-04-01&end_date=2026-04-30&page=1&limit=20
 *   200: { "success": true, "data": [ … ], "pagination": { page, limit, total, total_pages } }
 *
 * GET /transactions/:id
 *   200: { "success": true, "data": { … } }
 *
 * PUT /transactions/:id
 *   Body: { "amount": 175.00 }
 *   200: { "success": true, "data": { … } }
 *
 * DELETE /transactions/:id
 *   200: { "success": true, "message": "Transaction deleted" }
 */
const transactionService = require('../services/transaction.service');

const create = async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await transactionService.list(req.user.id, req.query);
    res.status(200).json({
      success:    true,
      data:       result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getById(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const transaction = await transactionService.update(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await transactionService.remove(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getById, update, remove };
