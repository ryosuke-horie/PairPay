import { type IUserRepository, UserRepository } from '../repositories/user.repository';
import { AuthService, type IAuthService } from '../services/auth.service';
import type { Bindings } from '../types';

export interface Container {
  userRepository: IUserRepository;
  authService: IAuthService;
}

export function createContainer(env: Bindings): Container {
  // リポジトリの初期化
  const userRepository = new UserRepository(env.DB);

  // サービスの初期化
  const authService = new AuthService(userRepository, env.JWT_SECRET);

  return {
    userRepository,
    authService,
  };
}

// DIコンテナをHonoのコンテキストに設定するためのミドルウェア
export function injectContainer(container: Container) {
  return async (c: any, next: any) => {
    c.container = container;
    await next();
  };
}
