import { createTransactionSchema } from '../../../../packages/shared/src/schemas/transaction';
import { convertToTRPCError } from '../../utils/error.js';
import { protectedProcedure, router } from '../trpc.js';

export const transactionRouter = router({
  // 取引作成
  create: protectedProcedure.input(createTransactionSchema).mutation(async ({ input, ctx }) => {
    try {
      const container = ctx.hono.get('container');
      await container.transactionService.createTransaction({
        payerId: Number(ctx.user.id),
        title: input.title,
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
