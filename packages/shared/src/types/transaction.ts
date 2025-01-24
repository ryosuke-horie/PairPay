import type { z } from 'zod';
import type { createTransactionSchema } from '../schemas/transaction';

// zodのpreTransformの型を取得
export type CreateTransactionInput = z.input<typeof createTransactionSchema>;
// zodのpostTransformの型を取得（変換後の型）
export type CreateTransactionOutput = z.output<typeof createTransactionSchema>;

export interface TransactionResponse {
  id: number;
  title: string;
  payerId: number;
  amount: number;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}