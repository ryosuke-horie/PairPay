import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';

// バリデーションスキーマ
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// 認証ルーターの作成
const authRouter = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// CORSの設定 - 開発用に全許可
authRouter.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // originが'*'の場合、credentialsはfalseである必要がある
  })
);

// ユーザー登録エンドポイント
authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const input = c.req.valid('json');

  try {
    await c.var.container.authService.register(input);

    return c.json({ message: 'User registered successfully' }, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Email already registered') {
        return c.json({ error: error.message }, 400);
      }
    }
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ログインエンドポイント
authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const input = c.req.valid('json');

  try {
    const result = await c.var.container.authService.login(input);
    return c.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid email or password') {
        return c.json({ error: error.message }, 401);
      }
    }
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default authRouter;
