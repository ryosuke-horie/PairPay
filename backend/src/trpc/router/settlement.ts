import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const settlementRouter = router({
  // 未精算の精算リストを取得
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

  // 精算を完了する
  settle: protectedProcedure
    .input(z.object({ settlementId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const container = ctx.hono.get('container');
      try {
        await container.settlementService.settle(input.settlementId);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`精算処理に失敗しました: ${error.message}`);
        }
        throw error;
      }
    }),
});
