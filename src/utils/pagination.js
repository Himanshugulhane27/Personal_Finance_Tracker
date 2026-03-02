/**
 * Pagination helper.
 * Builds SQL LIMIT/OFFSET and response metadata.
 */
const buildPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  total_pages: Math.ceil(total / limit),
  has_next: page < Math.ceil(total / limit),
  has_prev: page > 1,
});

module.exports = { buildPagination, paginationMeta };
