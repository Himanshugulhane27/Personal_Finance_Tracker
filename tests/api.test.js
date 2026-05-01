/**
 * Integration test suite — Personal Finance Tracker API.
 *
 * Requirements:
 *   1. A running PostgreSQL instance with the test DB created:
 *        createdb finance_tracker_test
 *   2. Migrations applied:
 *        DB_NAME=finance_tracker_test npm run migrate
 *   3. A .env.test or set DB_NAME=finance_tracker_test before running.
 *
 * Run:  npm test
 */
const request = require('supertest');
const app     = require('../src/app');
const db      = require('../src/db/pool');

/* ─── Shared state across tests ──────────────────────── */
let accessToken;
let refreshToken;
let userId;
let categoryId;       // expense category
let incomeCategoryId; // income category
let transactionId;
let budgetId;

/* ─── Setup & teardown ────────────────────────────────── */

beforeAll(async () => {
  // Clean all data before running the suite
  await db.query('DELETE FROM refresh_tokens');
  await db.query('DELETE FROM transactions');
  await db.query('DELETE FROM budgets');
  await db.query('DELETE FROM categories');
  await db.query('DELETE FROM users');
});

afterAll(async () => {
  await db.pool.end();
});

/* ═══════════════════════════════════════════════════════
 * 1. AUTH
 * ═══════════════════════════════════════════════════════ */

describe('Auth', () => {
  test('POST /auth/register — creates user and returns tokens', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Password123!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data).toHaveProperty('access_token');
    expect(res.body.data).toHaveProperty('refresh_token');

    accessToken  = res.body.data.access_token;
    refreshToken = res.body.data.refresh_token;
    userId       = res.body.data.user.id;
  });

  test('POST /auth/register — rejects duplicate email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Dupe', email: 'test@example.com', password: 'Password123!' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /auth/register — rejects invalid input', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: '', email: 'not-an-email', password: '123' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('POST /auth/login — authenticates with correct credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('access_token');

    // Update tokens for subsequent tests
    accessToken  = res.body.data.access_token;
    refreshToken = res.body.data.refresh_token;
  });

  test('POST /auth/login — rejects wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'WrongPass!' });

    expect(res.status).toBe(401);
  });

  test('POST /auth/refresh — rotates tokens', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('access_token');
    expect(res.body.data).toHaveProperty('refresh_token');

    // Old token should no longer work
    const oldRes = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken });

    expect(oldRes.status).toBe(401);

    // Use new tokens going forward
    accessToken  = res.body.data.access_token;
    refreshToken = res.body.data.refresh_token;
  });

  test('Protected route — rejects without token', async () => {
    const res = await request(app).get('/categories');
    expect(res.status).toBe(401);
  });

  test('Protected route — rejects invalid token', async () => {
    const res = await request(app)
      .get('/categories')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

/* ═══════════════════════════════════════════════════════
 * 2. CATEGORIES
 * ═══════════════════════════════════════════════════════ */

describe('Categories', () => {
  test('GET /categories — lists default seeded categories (12)', async () => {
    const res = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(12);

    // Store IDs for later use
    const expenseCat = res.body.data.find((c) => c.type === 'expense');
    const incomeCat  = res.body.data.find((c) => c.type === 'income');
    categoryId       = expenseCat.id;
    incomeCategoryId = incomeCat.id;
  });

  test('GET /categories?type=income — filters by type', async () => {
    const res = await request(app)
      .get('/categories?type=income')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((c) => c.type === 'income')).toBe(true);
    expect(res.body.data.length).toBe(4);
  });

  test('POST /categories — creates custom category', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Gym', type: 'expense', color: '#FF5733', icon: 'dumbbell' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Gym');
    expect(res.body.data.color).toBe('#FF5733');
  });

  test('POST /categories — rejects duplicate name', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Gym', type: 'expense' });

    expect(res.status).toBe(409);
  });

  test('PUT /categories/:id — updates category', async () => {
    const cats = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${accessToken}`);
    const gym = cats.body.data.find((c) => c.name === 'Gym');

    const res = await request(app)
      .put(`/categories/${gym.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Fitness', color: '#00FF00' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Fitness');
  });

  test('DELETE /categories/:id — deletes category', async () => {
    const cats = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${accessToken}`);
    const fitness = cats.body.data.find((c) => c.name === 'Fitness');

    const res = await request(app)
      .delete(`/categories/${fitness.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
  });
});

/* ═══════════════════════════════════════════════════════
 * 3. TRANSACTIONS
 * ═══════════════════════════════════════════════════════ */

describe('Transactions', () => {
  test('POST /transactions — creates an expense', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id: categoryId,
        amount:      150.50,
        type:        'expense',
        description: 'Weekly groceries',
        date:        new Date().toISOString().slice(0, 10),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe('150.50');
    expect(res.body.data.type).toBe('expense');
    transactionId = res.body.data.id;
  });

  test('POST /transactions — creates an income', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id: incomeCategoryId,
        amount:      5000,
        type:        'income',
        description: 'Monthly salary',
        date:        new Date().toISOString().slice(0, 10),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('income');
  });

  test('POST /transactions — rejects invalid amount', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id: categoryId,
        amount:      -100,
        type:        'expense',
      });

    expect(res.status).toBe(422);
  });

  test('GET /transactions — lists with pagination', async () => {
    const res = await request(app)
      .get('/transactions?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('total_pages');
    expect(res.body.pagination.page).toBe(1);
  });

  test('GET /transactions?type=expense — filters by type', async () => {
    const res = await request(app)
      .get('/transactions?type=expense')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((t) => t.type === 'expense')).toBe(true);
  });

  test('GET /transactions?start_date&end_date — filters by date range', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await request(app)
      .get(`/transactions?start_date=${today}&end_date=${today}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /transactions/:id — fetches single transaction', async () => {
    const res = await request(app)
      .get(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(transactionId);
    expect(res.body.data).toHaveProperty('category_name');
  });

  test('GET /transactions/:id — 404 for nonexistent', async () => {
    const res = await request(app)
      .get('/transactions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  test('PUT /transactions/:id — updates transaction', async () => {
    const res = await request(app)
      .put(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 175.00, description: 'Updated groceries' });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe('175.00');
    expect(res.body.data.description).toBe('Updated groceries');
  });

  test('DELETE /transactions/:id — deletes transaction', async () => {
    // Create a throwaway transaction first
    const create = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ category_id: categoryId, amount: 10, type: 'expense', description: 'Delete me' });

    const res = await request(app)
      .delete(`/transactions/${create.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Transaction deleted');
  });

  test('POST /transactions — recurring transaction', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id:     categoryId,
        amount:          99.99,
        type:            'expense',
        description:     'Netflix subscription',
        date:            new Date().toISOString().slice(0, 10),
        is_recurring:    true,
        recurrence_rule: 'monthly',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.is_recurring).toBe(true);
    expect(res.body.data.recurrence_rule).toBe('monthly');
  });
});

/* ═══════════════════════════════════════════════════════
 * 4. BUDGETS
 * ═══════════════════════════════════════════════════════ */

describe('Budgets', () => {
  test('POST /budgets — creates a monthly budget', async () => {
    const res = await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id:  categoryId,
        amount_limit: 500.00,
        period:       'monthly',
        start_date:   new Date().toISOString().slice(0, 10),
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    budgetId = res.body.data.id;
  });

  test('POST /budgets — rejects duplicate category+period', async () => {
    const res = await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id:  categoryId,
        amount_limit: 300.00,
        period:       'monthly',
        start_date:   new Date().toISOString().slice(0, 10),
      });

    expect(res.status).toBe(409);
  });

  test('GET /budgets — lists budgets with live spend tracking', async () => {
    const res = await request(app)
      .get('/budgets')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    const budget = res.body.data.find((b) => b.id === budgetId);
    expect(budget).toHaveProperty('current_spend');
    expect(budget).toHaveProperty('spend_percentage');
    expect(budget).toHaveProperty('remaining');
    expect(budget).toHaveProperty('warning');
    expect(typeof budget.warning).toBe('boolean');
  });

  test('GET /budgets — warning flag when spend >= 80%', async () => {
    // Create a tight budget to trigger warning
    // First get a different expense category
    const cats = await request(app)
      .get('/categories?type=expense')
      .set('Authorization', `Bearer ${accessToken}`);
    const otherCat = cats.body.data.find((c) => c.id !== categoryId);

    // Create expense of 90
    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id: otherCat.id,
        amount: 90,
        type: 'expense',
        date: new Date().toISOString().slice(0, 10),
      });

    // Create budget of 100 (spend is 90% = warning)
    const budgetRes = await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id: otherCat.id,
        amount_limit: 100,
        period: 'monthly',
        start_date: new Date().toISOString().slice(0, 10),
      });

    expect(budgetRes.status).toBe(201);

    // Fetch budgets to check warning
    const listRes = await request(app)
      .get('/budgets')
      .set('Authorization', `Bearer ${accessToken}`);

    const warningBudget = listRes.body.data.find((b) => b.id === budgetRes.body.data.id);
    expect(warningBudget.warning).toBe(true);
    expect(warningBudget.spend_percentage).toBeGreaterThanOrEqual(80);
  });

  test('PUT /budgets/:id — updates budget limit', async () => {
    const res = await request(app)
      .put(`/budgets/${budgetId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount_limit: 600.00 });

    expect(res.status).toBe(200);
    expect(res.body.data.amount_limit).toBe('600.00');
  });

  test('DELETE /budgets/:id — deletes budget', async () => {
    const res = await request(app)
      .delete(`/budgets/${budgetId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
  });
});

/* ═══════════════════════════════════════════════════════
 * 5. ANALYTICS
 * ═══════════════════════════════════════════════════════ */

describe('Analytics', () => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  test('GET /analytics/summary — returns financial summary', async () => {
    const res = await request(app)
      .get(`/analytics/summary?month=${currentMonth}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total_income');
    expect(res.body.data).toHaveProperty('total_expense');
    expect(res.body.data).toHaveProperty('net_savings');
    expect(res.body.data).toHaveProperty('savings_rate');
    expect(res.body.data.total_income).toBeGreaterThan(0);
    expect(res.body.data.total_expense).toBeGreaterThan(0);
  });

  test('GET /analytics/summary — rejects invalid month format', async () => {
    const res = await request(app)
      .get('/analytics/summary?month=2026-13')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(422);
  });

  test('GET /analytics/category-breakdown — returns per-category data', async () => {
    const res = await request(app)
      .get(`/analytics/category-breakdown?month=${currentMonth}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    if (res.body.data.length > 0) {
      const item = res.body.data[0];
      expect(item).toHaveProperty('category_name');
      expect(item).toHaveProperty('amount');
      expect(item).toHaveProperty('percentage_of_total');
      expect(item).toHaveProperty('previous_month_amount');
      expect(item).toHaveProperty('change_percentage');
    }
  });

  test('GET /analytics/trends — returns monthly income vs expense', async () => {
    const res = await request(app)
      .get('/analytics/trends?months=6')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(6);

    const entry = res.body.data[res.body.data.length - 1]; // current month
    expect(entry).toHaveProperty('month');
    expect(entry).toHaveProperty('income');
    expect(entry).toHaveProperty('expense');
    expect(entry).toHaveProperty('net');
  });

  test('GET /analytics/health-score — returns 0-100 score', async () => {
    const res = await request(app)
      .get('/analytics/health-score')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.score).toBeGreaterThanOrEqual(0);
    expect(res.body.data.score).toBeLessThanOrEqual(100);
    expect(res.body.data).toHaveProperty('grade');
    expect(res.body.data.breakdown).toHaveProperty('savings_rate');
    expect(res.body.data.breakdown).toHaveProperty('budget_adherence');
    expect(res.body.data.breakdown).toHaveProperty('consistency');
  });
});

/* ═══════════════════════════════════════════════════════
 * 6. CSV EXPORT
 * ═══════════════════════════════════════════════════════ */

describe('Export', () => {
  test('GET /export/transactions — downloads CSV', async () => {
    const res = await request(app)
      .get('/export/transactions')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.text).toContain('Transaction ID');
    expect(res.text).toContain('Amount');
  });

  test('GET /export/transactions — filters by date range', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await request(app)
      .get(`/export/transactions?start_date=${today}&end_date=${today}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
  });
});

/* ═══════════════════════════════════════════════════════
 * 7. ERROR HANDLING
 * ═══════════════════════════════════════════════════════ */

describe('Error handling', () => {
  test('404 for unknown routes', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('Error envelope structure', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
  });
});
