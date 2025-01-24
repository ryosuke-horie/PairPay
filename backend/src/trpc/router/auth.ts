import {
  loginInputSchema,
  registerInputSchema,
} from '../../../../packages/shared/src/schemas/auth.js';
import { convertToTRPCError } from '../../utils/error.js';
import { protectedProcedure, publicProcedure, router } from '../trpc.js';

export const authRouter = router({
  // ユーザー登録
  register: publicProcedure.input(registerInputSchema).mutation(async ({ input, ctx }) => {
    try {
      const container = ctx.hono.get('container');
      await container.authService.register(input);

      return {
        message: 'ユーザー登録が完了しました',
      };
    } catch (error) {
      throw convertToTRPCError(error);
    }
  }),

  // ログイン
  login: publicProcedure.input(loginInputSchema).mutation(async ({ input, ctx }) => {
    try {
      const container = ctx.hono.get('container');
      const result = await container.authService.login(input);

      return {
        message: 'ログインに成功しました',
        token: result.token,
        user: result.user,
      };
    } catch (error) {
      throw convertToTRPCError(error);
    }
  }),

  // ユーザー情報の取得（認証必須）
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      const container = ctx.hono.get('container');
      const user = await container.userRepository.findById(Number(ctx.user.id));

      if (!user) {
        throw new Error('User not found');
      }

      return { user };
    } catch (error) {
      throw convertToTRPCError(error);
    }
  }),

  // トークンの検証
  validateToken: publicProcedure.query(async ({ ctx }) => {
    const authHeader = ctx.hono.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false };
    }

    try {
      const token = authHeader.split(' ')[1];
      const container = ctx.hono.get('container');
      await container.authService.verifyToken(token);
      return { isValid: true };
    } catch (error) {
      return { isValid: false };
    }
  }),
});
