/**
 * Category routes — JWT protected, per-user CRUD.
 */
const { Router }   = require('express');
const Joi          = require('joi');
const { validate } = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const ctrl         = require('../controllers/category.controller');

const router = Router();
router.use(authenticate);

/* ─── Joi Schemas ─────────────────────────────────────── */

const createCategorySchema = Joi.object({
  name:  Joi.string().trim().min(1).max(100).required(),
  type:  Joi.string().valid('income', 'expense').required(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#6B7280'),
  icon:  Joi.string().max(50).default('tag'),
});

const updateCategorySchema = Joi.object({
  name:  Joi.string().trim().min(1).max(100).optional(),
  type:  Joi.string().valid('income', 'expense').optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon:  Joi.string().max(50).optional(),
}).min(1);

const listCategoriesQuery = Joi.object({
  type: Joi.string().valid('income', 'expense').optional(),
});

const idParam = Joi.object({
  id: Joi.string().uuid().required(),
});

/* ─── Routes ──────────────────────────────────────────── */

router.post('/',
  validate({ body: createCategorySchema }),
  ctrl.create
);

router.get('/',
  validate({ query: listCategoriesQuery }),
  ctrl.list
);

router.get('/:id',
  validate({ params: idParam }),
  ctrl.getById
);

router.put('/:id',
  validate({ params: idParam, body: updateCategorySchema }),
  ctrl.update
);

router.delete('/:id',
  validate({ params: idParam }),
  ctrl.remove
);

module.exports = router;
