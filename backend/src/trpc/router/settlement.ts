import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const settlementRouter = router({
  getStatus: protectedProcedure
    .input(
      z.object({
        partnerId: z.string().refine((value) => !Number.isNaN(Number.parseInt(value)), {
          message: 'Partner ID must be a valid number',
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const container = ctx.hono.get('container');
      try {
        return await container.settlementService.getSettlementStatus(
          Number.parseInt(ctx.user.id),
          Number.parseInt(input.partnerId)
        );
      } catch (error) {
        // エラーハンドリング
        if (error instanceof Error) {
          if (error.message === 'User not found') {
            throw new Error('指定されたユーザーが見つかりません');
          }
          if (error.message === 'Cannot calculate settlement with yourself') {
            throw new Error('自分自身との精算はできません');
          }
        }
        throw error;
      }
    }),
});
