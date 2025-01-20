import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IUserRepository } from '../../repositories/user.repository';
import type { UserCreateInput, UserLoginInput, UserResponse } from '../../types';
import { AuthService } from '../auth.service';

// auth.tsのモック
vi.mock('../../utils/auth', () => ({
  hashPassword: vi.fn((password: string) => `hashed_${password}`),
  generateJWT: vi.fn(() => 'mock_jwt_token'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: {
    findByEmail: Mock;
    findById: Mock;
    create: Mock;
  };
  const JWT_SECRET = 'test_secret';

  beforeEach(() => {
    // UserRepositoryのモックをリセット
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };

    authService = new AuthService(mockUserRepository as unknown as IUserRepository, JWT_SECRET);

    // 各テストの前にモックをリセット
    vi.clearAllMocks();
  });

  describe('register', () => {
    const registerInput: UserCreateInput = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('新規ユーザーを正常に登録できること', async () => {
      // メールアドレスの重複がないことを想定
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      await authService.register(registerInput);

      // リポジトリのメソッドが正しく呼ばれたことを確認
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerInput.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerInput,
        password: 'hashed_password123', // モック化されたhashPassword関数の結果
      });
    });

    it('既存のメールアドレスの場合エラーをスローすること', async () => {
      // メールアドレスが既に存在する場合を想定
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        name: 'Existing User',
        email: registerInput.email,
      });

      await expect(authService.register(registerInput)).rejects.toThrow(
        'このメールアドレスは既に登録されています'
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginInput: UserLoginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser: UserResponse & { password: string } = {
      id: 1,
      name: 'Test User',
      email: loginInput.email,
      password: 'hashed_password123',
    };

    it('有効な認証情報で正常にログインできること', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login(loginInput);

      expect(result).toEqual({
        token: 'mock_jwt_token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginInput.email);
    });

    it('存在しないメールアドレスの場合エラーをスローすること', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      await expect(authService.login(loginInput)).rejects.toThrow(
        'メールアドレスまたはパスワードが正しくありません'
      );
    });

    it('パスワードが一致しない場合エラーをスローすること', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        password: 'hashed_different_password',
      });

      await expect(authService.login(loginInput)).rejects.toThrow(
        'メールアドレスまたはパスワードが正しくありません'
      );
    });
  });
});
