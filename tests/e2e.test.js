const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/pool');

describe('E2E Full Flow', () => {
  let accessToken;
  let refreshToken;
  let categoryIdExpense;
  let categoryIdIncome;
  let transactionId;

  beforeAll(async () => {
    // Clean all data before running
    await db.query('DELETE FROM refresh_tokens');
    await db.query('DELETE FROM transactions');
    await db.query('DELETE FROM budgets');
    await db.query('DELETE FROM categories');
    await db.query('DELETE FROM users');
  });

  afterAll(async () => {
    await db.pool.end();
  });

  test('Happy Path Full Flow', async () => {
    // 1. Register new user
    let res = await request(app)
      .post('/auth/register')
      .send({ name: 'E2E User', email: 'e2e@example.com', password: 'Password123!' });
    expect(res.status).toBe(201);
    accessToken = res.body.data.access_token;
    refreshToken = res.body.data.refresh_token;

    // 2. Get default categories
    res = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const expenseCat = res.body.data.find((c) => c.type === 'expense');
    const incomeCat = res.body.data.find((c) => c.type === 'income');
    categoryIdExpense = expenseCat.id;
    categoryIdIncome = incomeCat.id;

    // 3. Create income transaction (salary)
    res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id: categoryIdIncome,
        amount: 5000,
        type: 'income',
        description: 'Salary',
        date: new Date().toISOString().slice(0, 10),
      });
    expect(res.status).toBe(201);

    // 4. Create expense transaction (food)
    res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id: categoryIdExpense,
        amount: 85,
        type: 'expense',
        description: 'Food',
        date: new Date().toISOString().slice(0, 10),
      });
    expect(res.status).toBe(201);
    transactionId = res.body.data.id;

    // 5. Set a budget for food category
    res = await request(app)
      .post('/budgets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category_id: categoryIdExpense,
        amount_limit: 100,
        period: 'monthly',
        start_date: new Date().toISOString().slice(0, 10),
      });
    expect(res.status).toBe(201);

    // 6. Exceed 80% of budget, verify warning=true in GET /budgets
    // We already spent 85 out of 100, which is 85%.
    res = await request(app)
      .get('/budgets')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const budget = res.body.data[0];
    expect(budget.warning).toBe(true);

    // 7. GET /analytics/summary — verify net_savings > 0
    const currentMonth = new Date().toISOString().slice(0, 7);
    res = await request(app)
      .get(`/analytics/summary?month=${currentMonth}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.net_savings).toBeGreaterThan(0);

    // 8. GET /analytics/health-score — verify score is a number 0-100
    res = await request(app)
      .get('/analytics/health-score')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.score).toBeGreaterThanOrEqual(0);
    expect(res.body.data.score).toBeLessThanOrEqual(100);

    // 9. Export CSV — verify Content-Type is text/csv
    res = await request(app)
      .get('/export/transactions')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');

    // 10. Refresh token — verify new tokens returned
    res = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken });
    expect(res.status).toBe(200);
    accessToken = res.body.data.access_token;

    // 11. Delete transaction — verify 404 on re-fetch
    res = await request(app)
      .delete(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);

    res = await request(app)
      .get(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});
