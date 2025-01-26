import { router } from '../trpc';
import { authRouter } from './auth.js';
import { balanceRouter } from './balance.js';
import { transactionRouter } from './transaction.js';

export const appRouter = router({
  auth: authRouter,
  transaction: transactionRouter,
  balance: balanceRouter,
});

export type AppRouter = typeof appRouter;
