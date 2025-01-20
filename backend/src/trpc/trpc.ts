import { TRPCError, initTRPC } from '@trpc/server';
import { convertToTRPCError } from '../utils/error.js';
import { type AuthenticatedContext, type Context, getUser } from './context.js';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        message: error.message,
      },
    };
  },
});

// ミドルウェア: 認証チェック
const isAuthed = t.middleware(async ({ ctx, next }) => {
  try {
    const user = await getUser(ctx);
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '認証が必要です',
      });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      } as AuthenticatedContext,
    });
  } catch (error) {
    throw convertToTRPCError(error);
  }
});

// グローバルミドルウェア: エラーハンドリング
const errorHandler = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    throw convertToTRPCError(error);
  }
});

export const router = t.router;
export const middleware = t.middleware;

// 各種プロシージャの定義
export const publicProcedure = t.procedure.use(errorHandler);
export const protectedProcedure = t.procedure.use(errorHandler).use(isAuthed);
