/**
 * Budget routes — JWT protected.
 */
const { Router }   = require('express');
const Joi          = require('joi');
const { validate } = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const ctrl         = require('../controllers/budget.controller');

const router = Router();
router.use(authenticate);

/* ─── Joi Schemas ─────────────────────────────────────── */

const createBudgetSchema = Joi.object({
  category_id:  Joi.string().uuid().required(),
  amount_limit: Joi.number().positive().precision(2).required(),
  period:       Joi.string().valid('monthly', 'weekly').required(),
  start_date:   Joi.date().iso().required(),
  end_date:     Joi.date().iso().greater(Joi.ref('start_date')).allow(null).optional(),
});

const updateBudgetSchema = Joi.object({
  category_id:  Joi.string().uuid().optional(),
  amount_limit: Joi.number().positive().precision(2).optional(),
  period:       Joi.string().valid('monthly', 'weekly').optional(),
  start_date:   Joi.date().iso().optional(),
  end_date:     Joi.date().iso().allow(null).optional(),
}).min(1);

const idParam = Joi.object({
  id: Joi.string().uuid().required(),
});

/* ─── Routes ──────────────────────────────────────────── */

router.post('/',
  validate({ body: createBudgetSchema }),
  ctrl.create
);

router.get('/', ctrl.list);

router.get('/:id',
  validate({ params: idParam }),
  ctrl.getById
);

router.put('/:id',
  validate({ params: idParam, body: updateBudgetSchema }),
  ctrl.update
);

router.delete('/:id',
  validate({ params: idParam }),
  ctrl.remove
);

module.exports = router;
