import type { Context, Next } from 'hono';
import type { Bindings, Variables } from '../types';
import { verifyJWT } from '../utils/auth';

export async function authMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization header is missing or invalid' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    // JWTの検証
    const payload = await verifyJWT(token, c.env.JWT_SECRET);

    // ペイロードをコンテキストに設定
    c.set('user', payload);

    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}
