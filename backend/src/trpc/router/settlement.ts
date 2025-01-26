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
});
