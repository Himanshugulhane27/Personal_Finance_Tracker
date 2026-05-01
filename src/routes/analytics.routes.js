/**
 * Analytics routes — JWT protected.
 */
const { Router }   = require('express');
const Joi          = require('joi');
const { validate } = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const ctrl         = require('../controllers/analytics.controller');

const router = Router();
router.use(authenticate);

/* ─── Joi Schemas ─────────────────────────────────────── */

const monthQuery = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .required()
    .messages({ 'string.pattern.base': "'month' must be in YYYY-MM format" }),
});

const trendsQuery = Joi.object({
  months: Joi.number().integer().min(1).max(24).default(6),
});

/* ─── Routes ──────────────────────────────────────────── */

router.get('/summary',
  validate({ query: monthQuery }),
  ctrl.summary
);

router.get('/category-breakdown',
  validate({ query: monthQuery }),
  ctrl.categoryBreakdown
);

router.get('/trends',
  validate({ query: trendsQuery }),
  ctrl.trends
);

router.get('/health-score', ctrl.healthScore);

module.exports = router;
