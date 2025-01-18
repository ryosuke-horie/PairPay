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

// カテゴリーテーブル
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  // iconは将来的にアイコンを追加する可能性を考慮
  icon: text('icon'),
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
  // カテゴリーID
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  // 金額（realを使用して小数点以下も扱えるようにする）
  amount: real('amount').notNull(),
  // 説明
  description: text('description'),
  // 取引日
  transactionDate: integer('transaction_date', { mode: 'timestamp' }).notNull(),
  // 共同支出フラグ
  isShared: integer('is_shared', { mode: 'boolean' }).notNull().default(false),
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
  // 負担割合（パーセント）
  sharePercentage: real('share_percentage').notNull(),
  // 負担額
  shareAmount: real('share_amount').notNull(),
  // 精算済みフラグ
  isSettled: integer('is_settled', { mode: 'boolean' }).notNull().default(false),
  // 精算日
  settledAt: integer('settled_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
