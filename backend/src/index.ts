import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createContainer } from './di/container.js';
import { trpcMiddleware } from './middleware/trpc.middleware.js';
import type { Bindings, Variables } from './types';

// アプリケーションの作成
const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// CORSの設定
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// グローバルミドルウェアの設定
app.use('*', async (c, next) => {
  // DIコンテナの初期化と注入
  const container = createContainer(c.env);
  c.set('container', container);
  await next();
});

// tRPCミドルウェアの追加
app.route('/trpc', trpcMiddleware);

export default app;

// tRPCの型定義をエクスポート
export type { AppRouter } from './trpc/router/index.js';
