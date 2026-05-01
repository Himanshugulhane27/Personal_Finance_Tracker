/**
 * Transaction routes — JWT protected.
 */
const { Router }   = require('express');
const Joi          = require('joi');
const { validate } = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const ctrl         = require('../controllers/transaction.controller');

const router = Router();
router.use(authenticate);

/* ─── Joi Schemas ─────────────────────────────────────── */

const uuidPattern = Joi.string().uuid();

const createTransactionSchema = Joi.object({
  category_id:     uuidPattern.required(),
  amount:          Joi.number().positive().precision(2).required(),
  type:            Joi.string().valid('income', 'expense').required(),
  description:     Joi.string().max(500).allow('', null).optional(),
  date:            Joi.date().iso().optional(),
  is_recurring:    Joi.boolean().optional().default(false),
  recurrence_rule: Joi.string().valid('daily', 'weekly', 'monthly')
                     .when('is_recurring', { is: true, then: Joi.required(), otherwise: Joi.optional().allow(null) }),
});

const updateTransactionSchema = Joi.object({
  category_id:     uuidPattern.optional(),
  amount:          Joi.number().positive().precision(2).optional(),
  type:            Joi.string().valid('income', 'expense').optional(),
  description:     Joi.string().max(500).allow('', null).optional(),
  date:            Joi.date().iso().optional(),
  is_recurring:    Joi.boolean().optional(),
  recurrence_rule: Joi.string().valid('daily', 'weekly', 'monthly').allow(null).optional(),
}).min(1);

const listTransactionsQuery = Joi.object({
  type:        Joi.string().valid('income', 'expense').optional(),
  category_id: uuidPattern.optional(),
  start_date:  Joi.date().iso().optional(),
  end_date:    Joi.date().iso().optional(),
  page:        Joi.number().integer().min(1).default(1),
  limit:       Joi.number().integer().min(1).max(100).default(20),
});

const idParam = Joi.object({
  id: uuidPattern.required(),
});

/* ─── Routes ──────────────────────────────────────────── */

router.post('/',
  validate({ body: createTransactionSchema }),
  ctrl.create
);

router.get('/',
  validate({ query: listTransactionsQuery }),
  ctrl.list
);

router.get('/:id',
  validate({ params: idParam }),
  ctrl.getById
);

router.put('/:id',
  validate({ params: idParam, body: updateTransactionSchema }),
  ctrl.update
);

router.delete('/:id',
  validate({ params: idParam }),
  ctrl.remove
);

module.exports = router;
