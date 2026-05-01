/**
 * Budget controller.
 *
 * POST /budgets
 *   Body: { "category_id": "uuid", "amount_limit": 500.00, "period": "monthly", "start_date": "2026-04-01" }
 *   201: { "success": true, "data": { … } }
 *
 * GET /budgets
 *   200: { "success": true, "data": [ { …budget, current_spend, spend_percentage, remaining, warning }, … ] }
 *
 * PUT /budgets/:id
 *   Body: { "amount_limit": 600.00 }
 *   200: { "success": true, "data": { … } }
 *
 * DELETE /budgets/:id
 *   200: { "success": true, "message": "Budget deleted" }
 */
const budgetService = require('../services/budget.service');

const create = async (req, res, next) => {
  try {
    const budget = await budgetService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const budgets = await budgetService.list(req.user.id);
    res.status(200).json({ success: true, data: budgets });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const budget = await budgetService.getById(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const budget = await budgetService.update(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await budgetService.remove(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getById, update, remove };
