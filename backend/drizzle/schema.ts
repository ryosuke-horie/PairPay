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

// 取引（収支）テーブル
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // 支出者のID
  payerId: integer('payer_id')
    .notNull()
    .references(() => users.id),
  // 金額
  amount: integer('amount').notNull(),
  // 取引日
  transactionDate: integer('transaction_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 共同支出の割り当てテーブル
export const sharedExpenses = sqliteTable('shared_expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // 取引ID
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transactions.id),
  // 割り当てられるユーザーID
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  // 負担額
  shareAmount: real('share_amount').notNull(),
  // 精算済みフラグ
  isSettled: integer('is_settled', { mode: 'boolean' }).notNull().default(false),
  // 精算日
  settledAt: integer('settled_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
