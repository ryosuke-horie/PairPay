import { router } from '../trpc';
import { authRouter } from './auth.js';
import { transactionRouter } from './transaction.js';
import { balanceRouter } from './balance.js';

export const appRouter = router({
  auth: authRouter,
  transaction: transactionRouter,
  balance: balanceRouter,
});

export type AppRouter = typeof appRouter;
