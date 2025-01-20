import { router } from '../trpc';
import { authRouter } from './auth.js';

export const appRouter = router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
