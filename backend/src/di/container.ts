import type { Context, Next } from 'hono';
import {
  type ITransactionRepository,
  TransactionRepository,
} from '../repositories/transaction.repository';
import { type IUserRepository, UserRepository } from '../repositories/user.repository';
import { AuthService, type IAuthService } from '../services/auth.service';
import { type ITransactionService, TransactionService } from '../services/transaction.service';
import { type IBalanceService, BalanceService } from '../services/balance.service';
import type { Bindings, Variables } from '../types';

export interface Container {
  userRepository: IUserRepository;
  authService: IAuthService;
  transactionRepository: ITransactionRepository;
  transactionService: ITransactionService;
  balanceService: IBalanceService;
}

export function createContainer(env: Bindings): Container {
  // リポジトリの初期化
  const userRepository = new UserRepository(env.DB);
  const transactionRepository = new TransactionRepository(env.DB);

  // サービスの初期化
  const authService = new AuthService(userRepository, env.JWT_SECRET);
  const transactionService = new TransactionService(transactionRepository, userRepository);
  const balanceService = new BalanceService(transactionRepository, userRepository);

  return {
    userRepository,
    authService,
    transactionRepository,
    transactionService,
    balanceService,
  };
}

// DIコンテナをHonoのコンテキストに設定するためのミドルウェア
export function injectContainer(container: Container) {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    c.set('container', container);
    await next();
  };
}
