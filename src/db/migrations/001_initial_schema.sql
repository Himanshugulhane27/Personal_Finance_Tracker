-- ============================================================
-- Personal Finance Tracker — Initial Schema Migration
-- Database: PostgreSQL 14+
-- Run:  psql -d finance_tracker -f 001_initial_schema.sql
-- ============================================================

BEGIN;

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- ─── Categories ──────────────────────────────────────────────
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  type       VARCHAR(10)  NOT NULL CHECK (type IN ('income', 'expense')),
  color      VARCHAR(7)   NOT NULL DEFAULT '#6B7280',
  icon       VARCHAR(50)  NOT NULL DEFAULT 'tag',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories (user_id);

-- ─── Transactions ────────────────────────────────────────────
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     UUID          NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  type            VARCHAR(10)   NOT NULL CHECK (type IN ('income', 'expense')),
  description     VARCHAR(500),
  date            DATE          NOT NULL DEFAULT CURRENT_DATE,
  is_recurring    BOOLEAN       NOT NULL DEFAULT FALSE,
  recurrence_rule VARCHAR(10)   CHECK (recurrence_rule IN ('daily', 'weekly', 'monthly')),
  parent_id       UUID          REFERENCES transactions(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id      ON transactions (user_id);
CREATE INDEX idx_transactions_category_id  ON transactions (category_id);
CREATE INDEX idx_transactions_date         ON transactions (date);
CREATE INDEX idx_transactions_type         ON transactions (type);
CREATE INDEX idx_transactions_user_date    ON transactions (user_id, date);
CREATE INDEX idx_transactions_user_type    ON transactions (user_id, type);
CREATE INDEX idx_transactions_recurring    ON transactions (is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX idx_transactions_parent_id    ON transactions (parent_id) WHERE parent_id IS NOT NULL;

-- ─── Budgets ─────────────────────────────────────────────────
CREATE TABLE budgets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  UUID          NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount_limit NUMERIC(15,2) NOT NULL CHECK (amount_limit > 0),
  period       VARCHAR(10)   NOT NULL CHECK (period IN ('monthly', 'weekly')),
  start_date   DATE          NOT NULL,
  end_date     DATE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, category_id, period)
);

CREATE INDEX idx_budgets_user_id     ON budgets (user_id);
CREATE INDEX idx_budgets_category_id ON budgets (category_id);

-- ─── Refresh Tokens ──────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,  -- SHA-256 hex, never raw token
  expires_at TIMESTAMPTZ NOT NULL,
  revoked    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_expires    ON refresh_tokens (expires_at) WHERE revoked = FALSE;

-- ─── Trigger: auto-update updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Trigger: seed 12 default categories on user creation ────
CREATE OR REPLACE FUNCTION seed_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, color, icon) VALUES
    -- Income (4)
    (NEW.id, 'Salary',        'income',  '#10B981', 'briefcase'),
    (NEW.id, 'Freelance',     'income',  '#3B82F6', 'laptop'),
    (NEW.id, 'Investments',   'income',  '#8B5CF6', 'trending-up'),
    (NEW.id, 'Other Income',  'income',  '#6366F1', 'plus-circle'),
    -- Expense (8)
    (NEW.id, 'Food & Dining',    'expense', '#EF4444', 'utensils'),
    (NEW.id, 'Transportation',   'expense', '#F97316', 'car'),
    (NEW.id, 'Housing',          'expense', '#EC4899', 'home'),
    (NEW.id, 'Utilities',        'expense', '#14B8A6', 'zap'),
    (NEW.id, 'Entertainment',    'expense', '#F59E0B', 'film'),
    (NEW.id, 'Healthcare',       'expense', '#06B6D4', 'heart'),
    (NEW.id, 'Shopping',         'expense', '#A855F7', 'shopping-bag'),
    (NEW.id, 'Education',        'expense', '#84CC16', 'book');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_seed_default_categories
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION seed_default_categories();

COMMIT;
