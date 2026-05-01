/**
 * Category controller.
 *
 * POST /categories
 *   Body: { "name": "Rent", "type": "expense", "color": "#EF4444", "icon": "home" }
 *   201: { "success": true, "data": { id, user_id, name, type, color, icon, … } }
 *
 * GET /categories?type=expense
 *   200: { "success": true, "data": [ … ] }
 *
 * GET /categories/:id
 *   200: { "success": true, "data": { … } }
 *
 * PUT /categories/:id
 *   Body: { "name": "Monthly Rent", "color": "#F97316" }
 *   200: { "success": true, "data": { … } }
 *
 * DELETE /categories/:id
 *   200: { "success": true, "message": "Category deleted" }
 */
const categoryService = require('../services/category.service');

const create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const categories = await categoryService.list(req.user.id, req.query);
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await categoryService.update(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await categoryService.remove(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getById, update, remove };
