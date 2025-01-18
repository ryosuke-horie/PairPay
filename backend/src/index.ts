import { Hono } from 'hono';
import { Bindings, Variables } from './types';
import authRouter from './routes/auth.route';

// アプリケーションの作成
const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// ルートの追加
app.route('/api/auth', authRouter);

export default app;
