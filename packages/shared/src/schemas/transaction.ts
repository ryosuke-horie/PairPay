import { z } from 'zod';

// バリデーションスキーマのみを定義
export const createTransactionSchema = z.object({
  amount: z.number().positive('金額は0より大きい値を入力してください'),
  transactionDate: z.date(),
});