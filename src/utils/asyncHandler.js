/**
 * Async handler wrapper for Express routes.
 * Eliminates the need for try/catch in every controller.
 *
 * Usage: router.get('/', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
