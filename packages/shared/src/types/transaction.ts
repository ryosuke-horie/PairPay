import type { z } from 'zod';
import type { createTransactionSchema } from '../schemas/transaction';

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export interface TransactionResponse {
  id: number;
  payerId: number;
  amount: number;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}