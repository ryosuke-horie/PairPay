import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const settlementRouter = router({
  getUnSettlementList: protectedProcedure.query(async ({ ctx }) => {
    const container = ctx.hono.get('container');
    try {
      return await container.settlementService.getUnSettlementList();
    } catch (error) {
      // エラーハンドリング
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          throw new Error('指定されたユーザーが見つかりません');
        }
      }
      throw error;
    }
  }),

  settle: protectedProcedure
    .input(z.object({ settlementId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // 精算処理のロジック
      return { success: true };
    }),
});
