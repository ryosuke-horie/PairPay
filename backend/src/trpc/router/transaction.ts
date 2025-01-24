import { z } from 'zod';
import { protectedProcedure, router } from '../trpc.js';
import { convertToTRPCError } from '../../utils/error.js';

// 入力スキーマの定義
const createTransactionSchema = z.object({
  amount: z.number().positive('金額は0より大きい値を入力してください'),
  transactionDate: z.date(),
});

export const transactionRouter = router({
  // 取引作成
  create: protectedProcedure
    .input(createTransactionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const container = ctx.hono.get('container');
        await container.transactionService.createTransaction({
          payerId: Number(ctx.user.id),
          amount: input.amount,
          transactionDate: input.transactionDate,
        });

        return {
          message: '取引を登録しました',
        };
      } catch (error) {
        throw convertToTRPCError(error);
      }
    }),

  // 取引履歴取得
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const container = ctx.hono.get('container');
      const transactions = await container.transactionService.getTransactionsByPayerId(
        Number(ctx.user.id)
      );

      return {
        transactions,
      };
    } catch (error) {
      throw convertToTRPCError(error);
    }
  }),
});