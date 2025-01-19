import type { Context as HonoContext } from 'hono';
import type { Container } from '../di/container.js';
import type { Bindings, Variables } from '../types';

// 基本のコンテキスト型
export interface Context {
  hono: HonoContext<{
    Bindings: Bindings;
    Variables: Variables & {
      container: Container;
    };
  }>;
}

// 認証済みコンテキスト型
export interface AuthenticatedContext extends Context {
  user: {
    id: string;
    email: string;
  };
}

// コンテキスト作成関数
export async function createContext({
  hono,
}: {
  hono: HonoContext<{
    Bindings: Bindings;
    Variables: Variables & {
      container: Container;
    };
  }>;
}): Promise<Context> {
  return {
    hono,
  };
}

// トークンからユーザー情報を取得する関数
export async function getUser(ctx: Context): Promise<{ id: string; email: string } | null> {
  const authHeader = ctx.hono.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const container = ctx.hono.get('container');
    const payload = await container.authService.verifyToken(token);

    return {
      id: payload.sub,
      email: payload.email,
    };
  } catch (error) {
    return null;
  }
}
