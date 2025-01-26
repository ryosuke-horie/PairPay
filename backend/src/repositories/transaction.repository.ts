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
  amount: number;
  userShare: number;
  partnerShare: number;
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
}

export class TransactionRepository implements ITransactionRepository {
  private db;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  async create(data: TransactionCreateInput): Promise<void> {
    await this.db
      .insert(transactions)
      .values({
        payerId: data.payerId,
        title: data.title,
        amount: data.amount,
        transactionDate: data.transactionDate,
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
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        userShare: sharedExpenses.shareAmount,
        partnerShare: sql<number>`(
          SELECT share_amount
          FROM ${sharedExpenses}
          WHERE transaction_id = ${transactions.id}
          AND user_id = ${partnerId}
          AND is_settled = 0
          LIMIT 1
        )`.as('partner_share'),
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
      amount: row.amount,
      userShare: row.userShare,
      partnerShare: row.partnerShare ?? 0,
      transactionDate: row.transactionDate,
    }));
  }

  async delete(id: number): Promise<void> {
    // まず関連する共同支出レコードを削除
    await this.db.delete(sharedExpenses).where(eq(sharedExpenses.transactionId, id)).execute();

    // 次に取引レコードを削除
    await this.db.delete(transactions).where(eq(transactions.id, id)).execute();
  }
}
