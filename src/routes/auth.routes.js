/**
 * Auth routes — public (no JWT required).
 */
const { Router }    = require('express');
const Joi           = require('joi');
const { validate }  = require('../middleware/validate');
const ctrl          = require('../controllers/auth.controller');

const router = Router();

/* ─── Joi Schemas ─────────────────────────────────────── */

const registerSchema = Joi.object({
  name:     Joi.string().trim().min(1).max(100).required(),
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(128).required(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

/* ─── Routes ──────────────────────────────────────────── */

router.post('/register', validate({ body: registerSchema }), ctrl.register);
router.post('/login',    validate({ body: loginSchema }),    ctrl.login);
router.post('/refresh',  validate({ body: refreshSchema }),  ctrl.refresh);

module.exports = router;
