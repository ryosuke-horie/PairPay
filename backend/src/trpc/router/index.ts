import { router } from '../trpc';
import { authRouter } from './auth.js';
import { transactionRouter } from './transaction.js';

export const appRouter = router({
  auth: authRouter,
  transaction: transactionRouter,
});

export type AppRouter = typeof appRouter;
