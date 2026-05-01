/**
 * Generic Joi validation middleware factory.
 *
 * Usage in routes:
 *
 *   const { validate } = require('../middleware/validate');
 *
 *   router.post('/',
 *     validate({ body: createTransactionSchema }),
 *     controller.create
 *   );
 *
 *   router.get('/',
 *     validate({ query: listTransactionsSchema }),
 *     controller.list
 *   );
 *
 * Validates body, query, and params independently when schemas are provided.
 * Strips unknown keys and coerces types (Joi defaults).
 */
const AppError = require('../utils/AppError');

/**
 * @param {{ body?: import('joi').Schema, query?: import('joi').Schema, params?: import('joi').Schema }} schemas
 */
const validate = (schemas) => (req, _res, next) => {
  const errors = [];

  for (const source of ['body', 'query', 'params']) {
    const schema = schemas[source];
    if (!schema) continue;

    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      errors.push(
        ...error.details.map((d) => d.message.replace(/"/g, "'"))
      );
    } else {
      // Replace with sanitized / coerced values
      req[source] = value;
    }
  }

  if (errors.length > 0) {
    return next(AppError.validation(errors.join('; ')));
  }

  next();
};

module.exports = { validate };
