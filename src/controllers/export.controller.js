/**
 * Export controller.
 *
 * GET /export/transactions?start_date=2026-01-01&end_date=2026-04-30
 *   200: CSV file download (Content-Type: text/csv)
 */
const exportService = require('../services/export.service');

const exportTransactions = async (req, res, next) => {
  try {
    const csv = await exportService.exportTransactionsCsv(req.user.id, req.query);

    const filename = `transactions_${req.query.start_date || 'all'}_to_${req.query.end_date || 'all'}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { exportTransactions };
