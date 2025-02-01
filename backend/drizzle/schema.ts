import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ユーザーテーブル
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 支出テーブル
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  payerId: integer('payer_id')
    .notNull()
    .references(() => users.id),
  amount: integer('amount').notNull(),
  type: text('type', { enum: ['shared', 'personal'] }).notNull().default('shared'),
  transactionDate: integer('transaction_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 共同支出の割り当てテーブルを最適化
export const sharedExpenses = sqliteTable('shared_expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transactions.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  shareRatio: real('share_ratio').notNull().default(50),
  shareAmount: real('share_amount').notNull(),
  isSettled: integer('is_settled', { mode: 'boolean' }).notNull().default(false),
  settledAt: integer('settled_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// インデックスの作成
export const sharedExpensesIndexes = {
  settledIndex: sql`
    CREATE INDEX IF NOT EXISTS idx_shared_expenses_settled 
    ON shared_expenses(is_settled, transaction_id)
  `,
  transactionDateIndex: sql`
    CREATE INDEX IF NOT EXISTS idx_transactions_date 
    ON transactions(transaction_date)
  `
};
