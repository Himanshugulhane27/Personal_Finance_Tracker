/**
 * Analytics controller.
 *
 * GET /analytics/summary?month=2026-04
 *   200: { "success": true, "data": { month, total_income, total_expense, net_savings, savings_rate } }
 *
 * GET /analytics/category-breakdown?month=2026-04
 *   200: { "success": true, "data": [ { category_id, category_name, amount, percentage_of_total, change_percentage, … } ] }
 *
 * GET /analytics/trends?months=6
 *   200: { "success": true, "data": [ { month, income, expense, net }, … ] }
 *
 * GET /analytics/health-score
 *   200: { "success": true, "data": { score, grade, breakdown: { savings_rate, budget_adherence, consistency } } }
 */
const analyticsService = require('../services/analytics.service');

const summary = async (req, res, next) => {
  try {
    const data = await analyticsService.getSummary(req.user.id, req.query.month);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const categoryBreakdown = async (req, res, next) => {
  try {
    const data = await analyticsService.getCategoryBreakdown(req.user.id, req.query.month);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const trends = async (req, res, next) => {
  try {
    const data = await analyticsService.getTrends(req.user.id, req.query.months);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const healthScore = async (req, res, next) => {
  try {
    const data = await analyticsService.getHealthScore(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { summary, categoryBreakdown, trends, healthScore };
