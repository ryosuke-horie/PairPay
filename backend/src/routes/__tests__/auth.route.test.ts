import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { Container } from '../../di/container';
import authRouter from '../auth.route';
import type { AuthService } from '../../services/auth.service';
import type { Variables, Bindings } from '../../types';

describe('Auth Routes', () => {
  let app: Hono<{ Bindings: Bindings; Variables: Variables }>;
  let mockAuthService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // AuthServiceのモックを作成
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
    };

    // コンテナのモックを作成
    const mockContainer: Partial<Container> = {
      authService: mockAuthService as unknown as AuthService,
    };

    // アプリケーションを初期化
    app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

    // コンテナをミドルウェアとして設定
    app.use('*', async (c, next) => {
      c.set('container', mockContainer as Container);
      await next();
    });

    // 認証ルートをマウント
    app.route('/auth', authRouter);
  });

  describe('POST /auth/register', () => {
    const validRegisterData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('正常に登録できること', async () => {
      mockAuthService.register.mockResolvedValue(undefined);

      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validRegisterData),
      });

      expect(res.status).toBe(201);
      expect(await res.json()).toEqual({ message: 'User registered successfully' });
      expect(mockAuthService.register).toHaveBeenCalledWith(validRegisterData);
    });

    it('バリデーションエラーを返すこと', async () => {
      const invalidData = {
        name: '', // 空の名前
        email: 'invalid-email', // 無効なメールアドレス
        password: '123', // 短すぎるパスワード
      };

      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    it('メールアドレス重複時にエラーを返すこと', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Email already registered'));

      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validRegisterData),
      });

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'Email already registered' });
    });
  });

  describe('POST /auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockLoginResponse = {
      token: 'mock_jwt_token',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      },
    };

    it('正常にログインできること', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validLoginData),
      });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(validLoginData);
    });

    it('無効な認証情報でエラーを返すこと', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid email or password'));

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validLoginData),
      });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Invalid email or password' });
    });

    it('バリデーションエラーを返すこと', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });
  });
});
