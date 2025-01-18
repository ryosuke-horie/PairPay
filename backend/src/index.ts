import { Hono } from 'hono';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';
import * as jose from 'jose';

// バリデーションスキーマ
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// バリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string; // JWT署名用のシークレットキー
};

const app = new Hono<{ Bindings: Bindings }>();

// パスワードのハッシュ化関数
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

// JWT生成関数
async function generateJWT(payload: { id: number; email: string }, secret: string): Promise<string> {
  const encodedSecret = new TextEncoder().encode(secret);
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('72h') // トークンの有効期限を3日間に設定
    .sign(encodedSecret);
  return jwt;
}

// ユーザー登録エンドポイント
app.post('/users', zValidator('json', registerSchema), async (c) => {
  const { name, email, password } = c.req.valid('json');
  const db: DrizzleD1Database = drizzle(c.env.DB);

  try {
    // メールアドレスの重複チェック
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーの作成
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).execute();

    return c.json({ message: 'User registered successfully' }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ログインエンドポイント
app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const db: DrizzleD1Database = drizzle(c.env.DB);

  try {
    // ユーザーの検索
    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // パスワードの検証
    const hashedPassword = await hashPassword(password);
    if (hashedPassword !== user.password) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // JWTの生成
    const token = await generateJWT(
      { id: user.id, email: user.email },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
