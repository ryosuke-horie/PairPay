import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { sharedExpenses, transactions } from '../../../drizzle/schema';
import { TransactionRepository } from '../transaction.repository';

type MockDb = {
  select: Mock;
  insert: Mock;
  delete: Mock;
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
  delete: vi.fn(),
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

// モック取引データ
const mockTransaction = {
  id: 1,
  payerId: 1,
  title: 'スーパーでの買い物',
  amount: 1000,
  transactionDate: new Date('2024-01-24'),
  createdAt: new Date(),
  updatedAt: new Date(),
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

describe('TransactionRepository', () => {
  let repository: TransactionRepository;

  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks();

    // DrizzleD1Databaseのメソッドをチェーン可能に設定
    mockDrizzleInstance.select.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.insert.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.delete.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.from.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.where.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.values.mockReturnValue(mockDrizzleInstance);

    repository = new TransactionRepository(createMockD1Database());
  });

  describe('findById', () => {
    it('IDで取引を正常に検索できること', async () => {
      mockDrizzleInstance.get.mockResolvedValue(mockTransaction);

      const result = await repository.findById(1);

      expect(mockDrizzleInstance.select).toHaveBeenCalledWith({
        id: transactions.id,
        payerId: transactions.payerId,
        title: transactions.title,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      });
      expect(mockDrizzleInstance.from).toHaveBeenCalledWith(transactions);
      expect(mockDrizzleInstance.where).toHaveBeenCalledWith(eq(transactions.id, 1));

      expect(result).toEqual(mockTransaction);
    });

    it('存在しないIDの場合undefinedを返すこと', async () => {
      mockDrizzleInstance.get.mockResolvedValue(undefined);

      const result = await repository.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('findByPayerId', () => {
    it('支払者IDで取引を正常に検索できること', async () => {
      const mockTransactions = [mockTransaction];
      mockDrizzleInstance.execute.mockResolvedValue(mockTransactions);

      const result = await repository.findByPayerId(1);

      expect(mockDrizzleInstance.select).toHaveBeenCalledWith({
        id: transactions.id,
        payerId: transactions.payerId,
        title: transactions.title,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      });
      expect(mockDrizzleInstance.from).toHaveBeenCalledWith(transactions);
      expect(mockDrizzleInstance.where).toHaveBeenCalledWith(eq(transactions.payerId, 1));

      expect(result).toEqual(mockTransactions);
    });

    it('取引が存在しない場合は空配列を返すこと', async () => {
      mockDrizzleInstance.execute.mockResolvedValue([]);

      const result = await repository.findByPayerId(999);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('取引を正常に作成できること', async () => {
      const input = {
        payerId: 1,
        title: 'スーパーでの買い物',
        amount: 1000,
        transactionDate: new Date('2024-01-24'),
      };

      await repository.create(input);

      expect(mockDrizzleInstance.insert).toHaveBeenCalled();
      expect(mockDrizzleInstance.values).toHaveBeenCalledWith({
        payerId: input.payerId,
        title: input.title,
        amount: input.amount,
        transactionDate: input.transactionDate,
      });
      expect(mockDrizzleInstance.execute).toHaveBeenCalled();
    });

    it('作成に失敗した場合エラーをスローすること', async () => {
      const input = {
        payerId: 1,
        title: 'スーパーでの買い物',
        amount: 1000,
        transactionDate: new Date('2024-01-24'),
      };

      mockDrizzleInstance.execute.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(input)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('全ての取引を正常に取得できること', async () => {
      const mockTransactions = [mockTransaction];
      mockDrizzleInstance.execute.mockResolvedValue(mockTransactions);

      const result = await repository.findAll();

      expect(mockDrizzleInstance.select).toHaveBeenCalledWith({
        id: transactions.id,
        payerId: transactions.payerId,
        title: transactions.title,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      });
      expect(mockDrizzleInstance.from).toHaveBeenCalledWith(transactions);
      expect(mockDrizzleInstance.execute).toHaveBeenCalled();
      expect(result).toEqual(mockTransactions);
    });

    it('取引が存在しない場合は空配列を返すこと', async () => {
      mockDrizzleInstance.execute.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('取引を正常に削除できること', async () => {
      mockDrizzleInstance.execute.mockResolvedValue(undefined);

      await repository.delete(1);

      // 共同支出レコードの削除が先に実行されること
      expect(mockDrizzleInstance.delete).toHaveBeenNthCalledWith(1, sharedExpenses);
      expect(mockDrizzleInstance.where).toHaveBeenNthCalledWith(
        1,
        eq(sharedExpenses.transactionId, 1)
      );

      // その後、取引レコードが削除されること
      expect(mockDrizzleInstance.delete).toHaveBeenNthCalledWith(2, transactions);
      expect(mockDrizzleInstance.where).toHaveBeenNthCalledWith(2, eq(transactions.id, 1));
    });

    it('削除に失敗した場合エラーをスローすること', async () => {
      mockDrizzleInstance.execute.mockRejectedValue(new Error('Database error'));

      await expect(repository.delete(1)).rejects.toThrow('Database error');
    });
  });
});
