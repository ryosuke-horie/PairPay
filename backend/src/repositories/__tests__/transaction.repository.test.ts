import { desc, eq } from 'drizzle-orm';
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
  innerJoin: Mock;
  orderBy: Mock;
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
  execute: vi.fn().mockImplementation(() => []),
  innerJoin: vi.fn(),
  orderBy: vi.fn(),
  $client: {} as D1Database,
};

// 各メソッドがチェーン可能なように自身を返すように設定
mockDrizzleInstance.select.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.insert.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.delete.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.from.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.where.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.values.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.innerJoin.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.orderBy.mockReturnValue(mockDrizzleInstance);

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
    mockDrizzleInstance.innerJoin.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.orderBy.mockReturnValue(mockDrizzleInstance);

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

  describe('findAllUnSettledTransactions', () => {
    it('未精算の取引を正しく取得できること', async () => {
      const mockResult = [
        {
          id: 1,
          payerId: 1,
          amount: 1000,
          transactionDate: new Date('2024-01-01'),
          firstShare: 500,
          secondShare: 500,
        },
        {
          id: 2,
          payerId: 2,
          amount: 2000,
          transactionDate: new Date('2024-01-02'),
          firstShare: 1000,
          secondShare: 1000,
        },
      ];

      // executeの戻り値を配列として明示的に型付け
      mockDrizzleInstance.execute.mockResolvedValue([...mockResult]);

      const result = await repository.findAllUnSettledTransactions();

      // クエリの構築が正しいことを確認
      expect(mockDrizzleInstance.select).toHaveBeenCalledWith({
        id: transactions.id,
        payerId: transactions.payerId,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        firstShare: sharedExpenses.shareAmount,
        secondShare: expect.any(Object), // SQLテンプレートリテラルのため、完全一致は検証しない
      });
      expect(mockDrizzleInstance.from).toHaveBeenCalledWith(transactions);
      expect(mockDrizzleInstance.innerJoin).toHaveBeenCalledWith(
        sharedExpenses,
        expect.any(Object) // andの条件は複雑なため、呼び出しのみ確認
      );
      expect(mockDrizzleInstance.orderBy).toHaveBeenCalledWith(desc(transactions.transactionDate));

      // 結果の変換が正しいことを確認
      expect(result).toEqual(mockResult);
    });

    it('未精算の取引が存在しない場合は空配列を返すこと', async () => {
      mockDrizzleInstance.execute.mockResolvedValue([]);

      const result = await repository.findAllUnSettledTransactions();

      expect(result).toEqual([]);
    });

    it('secondShareがnullの場合は0に変換されること', async () => {
      const mockResultWithNullShare = [
        {
          id: 1,
          payerId: 1,
          amount: 1000,
          transactionDate: new Date('2024-01-01'),
          firstShare: 500,
          secondShare: null,
        },
      ];

      // 配列として明示的に渡す
      mockDrizzleInstance.execute.mockResolvedValue([...mockResultWithNullShare]);

      const result = await repository.findAllUnSettledTransactions();

      expect(result[0].secondShare).toBe(0);
    });

    it('取引が日付の降順でソートされていることを確認', async () => {
      const mockSortedResult = [
        {
          id: 1,
          payerId: 1,
          amount: 1000,
          transactionDate: new Date('2024-01-02'),
          firstShare: 500,
          secondShare: 500,
        },
        {
          id: 2,
          payerId: 2,
          amount: 2000,
          transactionDate: new Date('2024-01-01'),
          firstShare: 1000,
          secondShare: 1000,
        },
      ];

      mockDrizzleInstance.execute.mockResolvedValue(mockSortedResult);

      const result = await repository.findAllUnSettledTransactions();

      expect(result[0].transactionDate).toEqual(new Date('2024-01-02'));
      expect(result[1].transactionDate).toEqual(new Date('2024-01-01'));
      expect(mockDrizzleInstance.orderBy).toHaveBeenCalledWith(desc(transactions.transactionDate));
    });

    it('データベースエラーが発生した場合はエラーを伝播すること', async () => {
      mockDrizzleInstance.execute.mockRejectedValue(new Error('Database error'));

      await expect(repository.findAllUnSettledTransactions()).rejects.toThrow('Database error');
    });
  });
});
