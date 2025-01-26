import { router } from '../trpc';
import { authRouter } from './auth.js';
import { settlementRouter } from './settlement.js';
import { transactionRouter } from './transaction.js';

export const appRouter = router({
  auth: authRouter,
  transaction: transactionRouter,
  settlement: settlementRouter,
});

export type AppRouter = typeof appRouter;
