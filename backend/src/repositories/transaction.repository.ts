import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { sharedExpenses, transactions } from '../../drizzle/schema.js';

export interface TransactionCreateInput {
  payerId: number;
  title: string;
  amount: number;
  transactionDate: Date;
}

export interface UnSettledTransactionResponse {
  id: number;
  payerId: number;
  title: string;
  amount: number;
  firstShare: number;
  secondShare: number;
  transactionDate: Date;
}

export interface TransactionResponse {
  id: number;
  payerId: number;
  title: string;
  amount: number;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionRepository {
  create(data: TransactionCreateInput): Promise<void>;
  findById(id: number): Promise<TransactionResponse | undefined>;
  findByPayerId(payerId: number): Promise<TransactionResponse[]>;
  findAll(): Promise<TransactionResponse[]>;
  delete(id: number): Promise<void>;
  findUnSettledTransactions(
    userId: number,
    partnerId: number
  ): Promise<UnSettledTransactionResponse[]>;
  findAllUnSettledTransactions(): Promise<UnSettledTransactionResponse[]>;
  settleTransaction(settlementId: number): Promise<void>;
}

export class TransactionRepository implements ITransactionRepository {
  private db;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  async create(data: TransactionCreateInput): Promise<void> {
    const result = await this.db
      .insert(transactions)
      .values({
        payerId: data.payerId,
        title: data.title,
        amount: data.amount,
        transactionDate: data.transactionDate,
      })
      .returning({ id: transactions.id })
      .execute();

    // 精算用のレコードを同時に作成
    await this.db
      .insert(sharedExpenses)
      .values({
        transactionId: result[0].id,
        userId: data.payerId,
        shareAmount: data.amount / 2,
        isSettled: false,
      })
      .execute();
  }

  async findById(id: number): Promise<TransactionResponse | undefined> {
    return await this.db
      .select({
        id: transactions.id,
        payerId: transactions.payerId,
        title: transactions.title,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      })
      .from(transactions)
      .where(eq(transactions.id, id))
      .get();
  }

  async findByPayerId(payerId: number): Promise<TransactionResponse[]> {
    return await this.db
      .select({
        id: transactions.id,
        payerId: transactions.payerId,
        title: transactions.title,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      })
      .from(transactions)
      .where(eq(transactions.payerId, payerId))
      .execute();
  }

  async findAll(): Promise<TransactionResponse[]> {
    return await this.db
      .select({
        id: transactions.id,
        payerId: transactions.payerId,
        title: transactions.title,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      })
      .from(transactions)
      .execute();
  }

  async findUnSettledTransactions(
    userId: number,
    partnerId: number
  ): Promise<UnSettledTransactionResponse[]> {
    const result = await this.db
      .select({
        id: transactions.id,
        payerId: transactions.payerId,
        title: transactions.title,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        firstShare: sharedExpenses.shareAmount,
        secondShare: sql<number>`(
          SELECT share_amount
          FROM ${sharedExpenses}
          WHERE transaction_id = ${transactions.id}
          AND user_id = ${partnerId}
          AND is_settled = 0
          LIMIT 1
        )`.as('second_share'),
      })
      .from(transactions)
      .innerJoin(
        sharedExpenses,
        and(
          eq(sharedExpenses.transactionId, transactions.id),
          eq(sharedExpenses.userId, userId),
          eq(sharedExpenses.isSettled, false)
        )
      )
      .where(inArray(transactions.payerId, [userId, partnerId]))
      .orderBy(desc(transactions.transactionDate));

    return result.map((row) => ({
      id: row.id,
      payerId: row.payerId,
      title: row.title,
      amount: row.amount,
      firstShare: row.firstShare,
      secondShare: row.secondShare ?? 0,
      transactionDate: row.transactionDate,
    }));
  }

  // ユーザーIDに依存しない形で全ての未精算取引を取得
  async findAllUnSettledTransactions(): Promise<UnSettledTransactionResponse[]> {
    const result = await this.db
      .select({
        id: transactions.id,
        payerId: transactions.payerId,
        title: transactions.title,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        firstShare: sharedExpenses.shareAmount,
        secondShare: sql<number>`(
          SELECT share_amount
          FROM ${sharedExpenses} se2
          WHERE se2.transaction_id = ${transactions.id}
          AND se2.user_id != ${sharedExpenses.userId}
          AND se2.is_settled = 0
          LIMIT 1
        )`.as('second_share'),
      })
      .from(transactions)
      .innerJoin(
        sharedExpenses,
        and(eq(sharedExpenses.transactionId, transactions.id), eq(sharedExpenses.isSettled, false))
      )
      .orderBy(desc(transactions.transactionDate))
      .execute();

    return result.map((row) => ({
      id: row.id,
      payerId: row.payerId,
      title: row.title,
      amount: row.amount,
      firstShare: row.firstShare,
      secondShare: row.secondShare ?? 0,
      transactionDate: row.transactionDate,
    }));
  }

  async delete(id: number): Promise<void> {
    // まず関連する共同支出レコードを削除
    await this.db.delete(sharedExpenses).where(eq(sharedExpenses.transactionId, id)).execute();

    // 次に取引レコードを削除
    await this.db.delete(transactions).where(eq(transactions.id, id)).execute();
  }

  async settleTransaction(settlementId: number): Promise<void> {
    await this.db
      .update(sharedExpenses)
      .set({ isSettled: true })
      .where(eq(sharedExpenses.transactionId, settlementId))
      .execute();
  }
}
