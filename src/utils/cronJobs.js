/**
 * Recurring transaction cron job.
 *
 * Runs daily at 00:05 UTC. For each recurring parent transaction,
 * checks if a new child transaction is due and creates it.
 */
const cron = require('node-cron');
const db   = require('../db/pool');

/**
 * Determine the next occurrence date from the last known date.
 */
const getNextDate = (lastDate, rule) => {
  const d = new Date(lastDate);
  switch (rule) {
    case 'daily':
      d.setUTCDate(d.getUTCDate() + 1);
      break;
    case 'weekly':
      d.setUTCDate(d.getUTCDate() + 7);
      break;
    case 'monthly':
      d.setUTCMonth(d.getUTCMonth() + 1);
      break;
    default:
      return null;
  }
  return d;
};

/**
 * Process all recurring transactions and create due child entries.
 */
const processRecurringTransactions = async () => {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[CRON] Processing recurring transactions for ${today}`);

  try {
    // Find all recurring parent transactions
    const { rows: parents } = await db.query(
      `SELECT t.*
       FROM transactions t
       WHERE t.is_recurring = TRUE
         AND t.parent_id IS NULL
         AND t.recurrence_rule IS NOT NULL`
    );

    let created = 0;

    for (const parent of parents) {
      // Find the most recent child (or use parent date as baseline)
      const { rows: lastChild } = await db.query(
        `SELECT date FROM transactions
         WHERE parent_id = $1
         ORDER BY date DESC
         LIMIT 1`,
        [parent.id]
      );

      const lastDate = lastChild.length > 0
        ? lastChild[0].date
        : parent.date;

      let nextDate = getNextDate(lastDate, parent.recurrence_rule);

      // Create all overdue child transactions (catch-up if cron was down)
      while (nextDate && nextDate.toISOString().slice(0, 10) <= today) {
        await db.query(
          `INSERT INTO transactions
             (user_id, category_id, amount, type, description, date,
              is_recurring, recurrence_rule, parent_id)
           VALUES ($1, $2, $3, $4, $5, $6, FALSE, NULL, $7)`,
          [
            parent.user_id,
            parent.category_id,
            parent.amount,
            parent.type,
            parent.description
              ? `[Auto] ${parent.description}`
              : '[Auto] Recurring transaction',
            nextDate.toISOString().slice(0, 10),
            parent.id,
          ]
        );
        created++;
        nextDate = getNextDate(nextDate, parent.recurrence_rule);
      }
    }

    console.log(`[CRON] Created ${created} recurring transaction(s)`);
  } catch (err) {
    console.error('[CRON] Error processing recurring transactions:', err);
  }
};

/**
 * Start the cron scheduler.
 * Schedule: every day at 00:05 UTC.
 */
const startCronJobs = () => {
  cron.schedule('5 0 * * *', processRecurringTransactions, {
    timezone: 'UTC',
  });
  console.log('⏰ Cron jobs scheduled (recurring transactions @ 00:05 UTC)');
};

module.exports = { startCronJobs, processRecurringTransactions };
