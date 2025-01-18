import { describe, it, expect } from 'vitest';
import { generateJWT, hashPassword, verifyJWT } from '../auth';

describe('Auth Utils', () => {
  const testSecret = 'test-secret-key';
  const testPayload = {
    id: 1,
    email: 'test@example.com',
  };

  describe('hashPassword', () => {
    it('文字列をSHA-256でハッシュ化できること', async () => {
      const password = 'test-password';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('同じパスワードで同じハッシュ値が生成されること', async () => {
      const password = 'test-password';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).toBe(hash2);
    });

    it('異なるパスワードで異なるハッシュ値が生成されること', async () => {
      const password1 = 'test-password-1';
      const password2 = 'test-password-2';
      const hash1 = await hashPassword(password1);
      const hash2 = await hashPassword(password2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateJWT', () => {
    it('有効なJWTトークンを生成できること', async () => {
      const token = await generateJWT(testPayload, testSecret);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWTは3つのパートで構成される
    });

    it('生成したトークンが検証可能であること', async () => {
      const token = await generateJWT(testPayload, testSecret);
      const decoded = await verifyJWT(token, testSecret);

      expect(decoded).toEqual(testPayload);
    });
  });

  describe('verifyJWT', () => {
    it('有効なトークンを正しく検証できること', async () => {
      const token = await generateJWT(testPayload, testSecret);
      const decoded = await verifyJWT(token, testSecret);

      expect(decoded).toEqual(testPayload);
    });

    it('無効なトークンでエラーをスローすること', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(verifyJWT(invalidToken, testSecret)).rejects.toThrow();
    });

    it('異なるシークレットでエラーをスローすること', async () => {
      const token = await generateJWT(testPayload, testSecret);
      const wrongSecret = 'wrong-secret';

      await expect(verifyJWT(token, wrongSecret)).rejects.toThrow();
    });

    it('期限切れトークンでエラーをスローすること', async () => {
      // 期限切れのJWTトークンを生成
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNTE2MjM5MDIyfQ.' +
        'X_QLuKWqghyVOXVvjGAuEROmOfT17_YlOUFt1U3F0UE';

      await expect(verifyJWT(expiredToken, testSecret)).rejects.toThrow();
    });
  });
});
