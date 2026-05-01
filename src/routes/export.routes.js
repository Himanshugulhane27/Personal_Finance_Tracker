/**
 * Export routes — JWT protected.
 */
const { Router }   = require('express');
const Joi          = require('joi');
const { validate } = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const ctrl         = require('../controllers/export.controller');

const router = Router();
router.use(authenticate);

/* ─── Joi Schemas ─────────────────────────────────────── */

const exportQuery = Joi.object({
  start_date: Joi.date().iso().optional(),
  end_date:   Joi.date().iso().optional(),
});

/* ─── Routes ──────────────────────────────────────────── */

router.get('/transactions',
  validate({ query: exportQuery }),
  ctrl.exportTransactions
);

module.exports = router;
