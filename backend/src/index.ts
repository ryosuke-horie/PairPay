import { Hono } from 'hono';
import { Bindings, Variables } from './types';
import authRouter from './routes/auth.route';
import { createContainer, injectContainer } from './di/container';

// アプリケーションの作成
const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// グローバルミドルウェアの設定
app.use('*', async (c, next) => {
  // DIコンテナの初期化と注入
  const container = createContainer(c.env);
  c.set('container', container);
  await next();
});

// ルートの追加
app.route('/api/auth', authRouter);

export default app;
