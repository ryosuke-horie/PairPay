import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { transactions } from '../../drizzle/schema.js';

export interface TransactionCreateInput {
  payerId: number;
  title: string;
  amount: number;
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
}