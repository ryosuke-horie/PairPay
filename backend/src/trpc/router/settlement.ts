import { protectedProcedure, router } from '../trpc';

export const settlementRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const container = ctx.hono.get('container');
    try {
      return await container.settlementService.getSettlementStatus(Number.parseInt(ctx.user.id));
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
});
