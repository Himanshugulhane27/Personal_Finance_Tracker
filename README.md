# Personal Finance Tracker API

A production-grade REST API for personal finance management built with **Node.js**, **Express**, and **PostgreSQL** (raw queries, no ORM).

## Features

- **JWT Authentication** — Access + refresh token rotation with SHA-256 hashed storage and reuse detection
- **Transaction Management** — Full CRUD with filtering (type, category, date range) and pagination
- **Category System** — Per-user categories with 12 auto-seeded defaults via PostgreSQL trigger
- **Budget Tracking** — Set per-category budgets with live spend tracking and 80% warning flags
- **Analytics Engine** — Monthly summary, category breakdown with MoM comparison, multi-month trends, financial health score (0–100)
- **Recurring Transactions** — node-cron job (daily 00:05 UTC) auto-creates child transactions
- **CSV Export** — Download transaction history as CSV with date range filters

---

## Tech Stack

| Layer       | Technology                   |
|-------------|------------------------------|
| Runtime     | Node.js                      |
| Framework   | Express 4                    |
| Database    | PostgreSQL 14+ (raw `pg`)    |
| Auth        | JWT (access + refresh)       |
| Validation  | Joi                          |
| Scheduling  | node-cron                    |
| Testing     | Jest + Supertest             |

---

## Project Structure

```
├── src/
│   ├── app.js                  # Express app config
│   ├── server.js               # Entry point
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.js
│   │   ├── transaction.controller.js
│   │   ├── category.controller.js
│   │   ├── budget.controller.js
│   │   ├── analytics.controller.js
│   │   └── export.controller.js
│   ├── services/               # Business logic
│   │   ├── auth.service.js
│   │   ├── transaction.service.js
│   │   ├── category.service.js
│   │   ├── budget.service.js
│   │   ├── analytics.service.js
│   │   └── export.service.js
│   ├── routes/                 # Express routers + Joi schemas
│   │   ├── auth.routes.js
│   │   ├── transaction.routes.js
│   │   ├── category.routes.js
│   │   ├── budget.routes.js
│   │   ├── analytics.routes.js
│   │   └── export.routes.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── validate.js         # Joi validation factory
│   │   └── errorHandler.js     # Centralized error handler
│   ├── db/
│   │   ├── pool.js             # PG connection pool + helpers
│   │   ├── migrate.js          # Migration runner
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   └── utils/
│       ├── AppError.js         # Custom error class
│       ├── helpers.js          # SHA-256, date parsing, etc.
│       └── cronJobs.js         # Recurring transaction scheduler
├── tests/
│   └── api.test.js             # Integration test suite
├── .env.example
├── package.json
└── README.md
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 2. Clone & Install

```bash
cd "Personal Finance Tracker"
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 4. Create Database & Run Migrations

```bash
createdb finance_tracker
npm run migrate
```

### 5. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3000`

### 6. Run the Frontend

The frontend is a lightweight Single-Page Application (SPA) built with React and TailwindCSS via CDN. No build step is required!

1. Open `frontend/index.html` in your browser.
2. Alternatively, serve it using any static server:
   ```bash
   npx serve frontend
   ```

### 7. Run Tests

```bash
# Integration Tests
createdb finance_tracker_test
DB_NAME=finance_tracker_test npm run migrate
DB_NAME=finance_tracker_test npm test

# End-to-End Test (Tests the full user flow)
DB_NAME=finance_tracker_test npm run test tests/e2e.test.js
```

---

## API Reference

### Health Check

```bash
curl -X GET http://localhost:3000/health
```
Response:
```json
{ "status": "ok", "database": "connected", "timestamp": "…" }
```

### Authentication (Public)

#### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "John", "email": "john@example.com", "password": "MyP@ss123" }'
```

201: {
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "John", "email": "john@example.com", "created_at": "…" },
    "access_token": "eyJ…",
    "refresh_token": "a1b2c3…"
  }
}

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "john@example.com", "password": "MyP@ss123" }'
```

200: { "success": true, "data": { "user": {…}, "access_token": "…", "refresh_token": "…" } }

#### Refresh Tokens
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refresh_token": "a1b2c3…" }'
```

200: { "success": true, "data": { "access_token": "…", "refresh_token": "…" } }

> **Note:** Refresh tokens are rotated on each use. The old token is revoked. If a revoked token is reused, ALL tokens for that user are invalidated (security measure).

---

### Transactions (JWT Required)

All endpoints below require: `Authorization: Bearer <access_token>`

#### Create Transaction
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "uuid",
    "amount": 150.50,
    "type": "expense",
    "description": "Weekly groceries",
    "date": "2026-04-30",
    "is_recurring": false
  }'
```

201: { "success": true, "data": { "id": "uuid", … } }

#### List Transactions (Filtered + Paginated)
```bash
curl -X GET "http://localhost:3000/transactions?type=expense&category_id=uuid&start_date=2026-04-01&end_date=2026-04-30&page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

200: {
  "success": true,
  "data": [ … ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "total_pages": 3 }
}

#### Get / Update / Delete
```bash
curl -X GET http://localhost:3000/transactions/:id -H "Authorization: Bearer <access_token>"
curl -X PUT http://localhost:3000/transactions/:id -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" -d '{ "amount": 200 }'
curl -X DELETE http://localhost:3000/transactions/:id -H "Authorization: Bearer <access_token>"
```

---

### Categories (JWT Required)

```bash
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Rent", "type": "expense", "color": "#EF4444", "icon": "home" }'

curl -X GET "http://localhost:3000/categories?type=expense" -H "Authorization: Bearer <access_token>"
curl -X GET http://localhost:3000/categories/:id -H "Authorization: Bearer <access_token>"
curl -X PUT http://localhost:3000/categories/:id -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" -d '{ "name": "Updated" }'
curl -X DELETE http://localhost:3000/categories/:id -H "Authorization: Bearer <access_token>"
```

> 12 default categories are auto-created when a user registers (4 income + 8 expense).

---

### Budgets (JWT Required)

#### Create Budget
```bash
curl -X POST http://localhost:3000/budgets \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{ "category_id": "uuid", "amount_limit": 500, "period": "monthly", "start_date": "2026-04-01" }'
```

#### List Budgets (with Live Tracking)
```bash
curl -X GET http://localhost:3000/budgets -H "Authorization: Bearer <access_token>"
```
Response includes per-budget:
  - current_spend     — actual spend in current period
  - spend_percentage  — current_spend / amount_limit × 100
  - remaining         — amount_limit - current_spend
  - warning           — true when spend ≥ 80% of limit

---

### Analytics (JWT Required)

#### Monthly Summary
```bash
curl -X GET "http://localhost:3000/analytics/summary?month=2026-04" \
  -H "Authorization: Bearer <access_token>"
```

200: {
  "success": true,
  "data": {
    "month": "2026-04",
    "total_income": 5000.00,
    "total_expense": 3200.00,
    "net_savings": 1800.00,
    "savings_rate": 36.00
  }
}

#### Category Breakdown
```bash
curl -X GET "http://localhost:3000/analytics/category-breakdown?month=2026-04" \
  -H "Authorization: Bearer <access_token>"
```

200: {
  "data": [
    {
      "category_name": "Food & Dining",
      "amount": 800.00,
      "percentage_of_total": 25.00,
      "previous_month_amount": 650.00,
      "change_percentage": 23.08
    }, …
  ]
}

#### Trends
```bash
curl -X GET "http://localhost:3000/analytics/trends?months=6" \
  -H "Authorization: Bearer <access_token>"
```

200: {
  "data": [
    { "month": "2025-11", "income": 5000, "expense": 3200, "net": 1800 },
    { "month": "2025-12", "income": 5200, "expense": 2900, "net": 2300 },
    …
  ]
}

#### Financial Health Score
```bash
curl -X GET http://localhost:3000/analytics/health-score \
  -H "Authorization: Bearer <access_token>"
```

200: {
  "data": {
    "score": 72,
    "grade": "B",
    "breakdown": {
      "savings_rate":     { "score": 32, "max": 40, "details": "…" },
      "budget_adherence": { "score": 25, "max": 35, "details": "…" },
      "consistency":      { "score": 15, "max": 25, "details": "…" }
    }
  }
}

---

### CSV Export (JWT Required)

```bash
curl -X GET "http://localhost:3000/export/transactions?start_date=2026-01-01&end_date=2026-04-30" \
  -H "Authorization: Bearer <access_token>" \
  -o transactions.csv
```

---

## Error Response Format

All errors follow a consistent envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "'amount' must be a positive number"
  }
}
```

| Status | Code              | When                          |
|--------|-------------------|-------------------------------|
| 400    | BAD_REQUEST       | Invalid input / logic error   |
| 401    | UNAUTHORIZED      | Missing / expired token       |
| 403    | FORBIDDEN         | Access denied                 |
| 404    | NOT_FOUND         | Resource doesn't exist        |
| 409    | CONFLICT          | Duplicate resource            |
| 422    | VALIDATION_ERROR  | Joi validation failure        |
| 500    | INTERNAL_ERROR    | Unexpected server error       |

---

## Database Schema

5 tables with indexes, triggers, and constraints:

- **users** — UUID PK, unique email, bcrypt password hash
- **categories** — per-user, unique (user_id, name), type enum
- **transactions** — references user + category, NUMERIC(15,2) amount, optional recurring
- **budgets** — per-category per-period, unique (user_id, category_id, period)
- **refresh_tokens** — SHA-256 hashed, with expiry and revocation flag

Auto-triggers:
- `updated_at` auto-updates on all tables
- 12 default categories seeded on user creation

---

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request
