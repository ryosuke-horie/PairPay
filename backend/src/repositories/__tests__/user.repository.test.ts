import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { UserRepository } from '../user.repository';
import { users } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import type { UserResponse, UserCreateInput } from '../../types';
import { DrizzleD1Database } from 'drizzle-orm/d1';

type MockDb = {
  select: Mock;
  insert: Mock;
  from: Mock;
  where: Mock;
  get: Mock;
  values: Mock;
  execute: Mock;
  $client: D1Database;
};

// drizzle-orm/d1のモック
const mockDrizzleInstance = {
  select: vi.fn(),
  insert: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  get: vi.fn(),
  values: vi.fn(),
  execute: vi.fn(),
  $client: {} as D1Database,
};

vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => mockDrizzleInstance as unknown as DrizzleD1Database),
}));

// モックユーザーデータ
const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword123',
};

// D1Databaseのモックを作成
const createMockD1Database = () => {
  return {
    prepare: vi.fn(),
    dump: vi.fn(),
    batch: vi.fn(),
    exec: vi.fn(),
  } as unknown as D1Database;
};

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks();

    // DrizzleD1Databaseのメソッドをチェーン可能に設定
    mockDrizzleInstance.select.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.insert.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.from.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.where.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.values.mockReturnValue(mockDrizzleInstance);

    repository = new UserRepository(createMockD1Database());
  });

  describe('findByEmail', () => {
    it('メールアドレスでユーザーを正常に検索できること', async () => {
      // モックの戻り値を設定
      mockDrizzleInstance.get.mockResolvedValue(mockUser);

      const result = await repository.findByEmail(mockUser.email);

      // 正しいパラメータでクエリが実行されたことを確認
      expect(mockDrizzleInstance.select).toHaveBeenCalledWith({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
      });
      expect(mockDrizzleInstance.from).toHaveBeenCalledWith(users);
      expect(mockDrizzleInstance.where).toHaveBeenCalledWith(eq(users.email, mockUser.email));

      // 結果が期待通りであることを確認
      expect(result).toEqual(mockUser);
    });

    it('存在しないメールアドレスの場合undefinedを返すこと', async () => {
      mockDrizzleInstance.get.mockResolvedValue(undefined);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('IDでユーザーを正常に検索できること', async () => {
      const userWithoutPassword: UserResponse = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      };
      mockDrizzleInstance.get.mockResolvedValue(userWithoutPassword);

      const result = await repository.findById(1);

      expect(mockDrizzleInstance.select).toHaveBeenCalledWith({
        id: users.id,
        name: users.name,
        email: users.email,
      });
      expect(mockDrizzleInstance.from).toHaveBeenCalledWith(users);
      expect(mockDrizzleInstance.where).toHaveBeenCalledWith(eq(users.id, 1));

      expect(result).toEqual(userWithoutPassword);
    });

    it('存在しないIDの場合undefinedを返すこと', async () => {
      mockDrizzleInstance.get.mockResolvedValue(undefined);

      const result = await repository.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('ユーザーを正常に作成できること', async () => {
      const input: UserCreateInput & { password: string } = {
        name: 'New User',
        email: 'new@example.com',
        password: 'hashedPassword456',
      };

      await repository.create(input);

      expect(mockDrizzleInstance.insert).toHaveBeenCalled();
      expect(mockDrizzleInstance.values).toHaveBeenCalledWith({
        name: input.name,
        email: input.email,
        password: input.password,
      });
      expect(mockDrizzleInstance.execute).toHaveBeenCalled();
    });

    it('作成に失敗した場合エラーをスローすること', async () => {
      const input: UserCreateInput & { password: string } = {
        name: 'New User',
        email: 'new@example.com',
        password: 'hashedPassword456',
      };

      mockDrizzleInstance.execute.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(input)).rejects.toThrow('Database error');
    });
  });
});
