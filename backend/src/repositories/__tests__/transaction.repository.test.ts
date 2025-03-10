import { desc, eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { sharedExpenses, transactions } from '../../../drizzle/schema';
import { TransactionRepository } from '../transaction.repository';

type MockDb = {
  select: Mock;
  insert: Mock;
  delete: Mock;
  update: Mock;
  set: Mock;
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
  update: vi.fn(),
  set: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  get: vi.fn(),
  values: vi.fn(),
  execute: vi.fn().mockImplementation(() => []),
  innerJoin: vi.fn(),
  orderBy: vi.fn(),
  returning: vi.fn(),
  $client: {} as D1Database,
};

// 各メソッドがチェーン可能なように自身を返すように設定
mockDrizzleInstance.select.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.insert.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.delete.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.update.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.set.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.from.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.where.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.values.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.innerJoin.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.orderBy.mockReturnValue(mockDrizzleInstance);
mockDrizzleInstance.returning.mockReturnValue(mockDrizzleInstance);

vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => mockDrizzleInstance as unknown as DrizzleD1Database),
}));

// モック支出データ
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
    mockDrizzleInstance.update.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.set.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.from.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.where.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.values.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.innerJoin.mockReturnValue(mockDrizzleInstance);
    mockDrizzleInstance.orderBy.mockReturnValue(mockDrizzleInstance);

    repository = new TransactionRepository(createMockD1Database());
  });

  describe('findById', () => {
    it('IDで支出を正常に検索できること', async () => {
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
    it('支払者IDで支出を正常に検索できること', async () => {
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

    it('支出が存在しない場合は空配列を返すこと', async () => {
      mockDrizzleInstance.execute.mockResolvedValue([]);

      const result = await repository.findByPayerId(999);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('支出を正常に作成できること', async () => {
      // returning の結果をモック
      mockDrizzleInstance.returning.mockReturnValue(mockDrizzleInstance);
      mockDrizzleInstance.execute.mockResolvedValueOnce([{ id: 1 }]);

      const input = {
        payerId: 1,
        title: 'スーパーでの買い物',
        amount: 1000,
        transactionDate: new Date('2024-01-24'),
      };

      await repository.create(input);

      // transactions テーブルへの挿入を確認
      expect(mockDrizzleInstance.insert).toHaveBeenNthCalledWith(1, transactions);
      expect(mockDrizzleInstance.values).toHaveBeenNthCalledWith(1, {
        payerId: input.payerId,
        title: input.title,
        amount: input.amount,
        transactionDate: input.transactionDate,
      });

      // sharedExpenses テーブルへの挿入を確認
      expect(mockDrizzleInstance.insert).toHaveBeenNthCalledWith(2, sharedExpenses);
      expect(mockDrizzleInstance.values).toHaveBeenNthCalledWith(2, {
        transactionId: 1,
        userId: input.payerId,
        shareAmount: input.amount / 2,
        isSettled: false,
      });
    });

    it('作成に失敗した場合エラーをスローすること', async () => {
      mockDrizzleInstance.returning.mockReturnValue(mockDrizzleInstance);
      mockDrizzleInstance.execute.mockRejectedValueOnce(new Error('Database error'));

      const input = {
        payerId: 1,
        title: 'スーパーでの買い物',
        amount: 1000,
        transactionDate: new Date('2024-01-24'),
      };

      await expect(repository.create(input)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('全ての支出を正常に取得できること', async () => {
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

    it('支出が存在しない場合は空配列を返すこと', async () => {
      mockDrizzleInstance.execute.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('支出を正常に削除できること', async () => {
      mockDrizzleInstance.execute.mockResolvedValue(undefined);

      await repository.delete(1);

      // 共同支出レコードの削除が先に実行されること
      expect(mockDrizzleInstance.delete).toHaveBeenNthCalledWith(1, sharedExpenses);
      expect(mockDrizzleInstance.where).toHaveBeenNthCalledWith(
        1,
        eq(sharedExpenses.transactionId, 1)
      );

      // その後、支出レコードが削除されること
      expect(mockDrizzleInstance.delete).toHaveBeenNthCalledWith(2, transactions);
      expect(mockDrizzleInstance.where).toHaveBeenNthCalledWith(2, eq(transactions.id, 1));
    });

    it('削除に失敗した場合エラーをスローすること', async () => {
      mockDrizzleInstance.execute.mockRejectedValue(new Error('Database error'));

      await expect(repository.delete(1)).rejects.toThrow('Database error');
    });
  });

  describe('findAllUnSettledTransactions', () => {
    it('正しいクエリで未精算支出を取得する', async () => {
      const mockResult = [
        {
          id: 1,
          payerId: 1,
          title: 'Test',
          amount: 1000,
          firstShare: 500,
          secondShare: 500,
          firstShareRatio: 50,
          secondShareRatio: 50,
          transactionDate: new Date(),
        },
      ];

      mockDrizzleInstance.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue(mockResult),
            }),
          }),
        }),
      });

      const result = await repository.findAllUnSettledTransactions();

      expect(mockDrizzleInstance.select).toHaveBeenCalledWith({
        id: transactions.id,
        payerId: transactions.payerId,
        title: transactions.title,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        firstShare: sharedExpenses.shareAmount,
        firstShareRatio: sharedExpenses.shareRatio,
        secondShare: expect.anything(), // sqlクエリのため、具体的な値は期待しない
        secondShareRatio: expect.anything(), // sqlクエリのため、具体的な値は期待しない
      });

      expect(result).toEqual(mockResult);
    });

    it('未精算の支出が存在しない場合は空配列を返すこと', async () => {
      mockDrizzleInstance.execute.mockResolvedValue([]);

      const result = await repository.findAllUnSettledTransactions();

      expect(result).toEqual([]);
    });

    it('secondShareがnullの場合は0に変換されること', async () => {
      const mockResultWithNullShare = [
        {
          id: 1,
          payerId: 1,
          title: 'テスト支出',
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

    it('支出が日付の降順でソートされていることを確認', async () => {
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

  describe('settleTransaction', () => {
    it('支出を正常に精算済みにできること', async () => {
      mockDrizzleInstance.execute.mockResolvedValue(undefined);

      await repository.settleTransaction(1);

      // updateの呼び出しを確認
      expect(mockDrizzleInstance.update).toHaveBeenCalledWith(sharedExpenses);
      expect(mockDrizzleInstance.set).toHaveBeenCalledWith({ isSettled: true });
      expect(mockDrizzleInstance.where).toHaveBeenCalledWith(eq(sharedExpenses.transactionId, 1));
      expect(mockDrizzleInstance.execute).toHaveBeenCalled();
    });

    it('精算処理に失敗した場合エラーをスローすること', async () => {
      mockDrizzleInstance.execute.mockRejectedValue(new Error('Database error'));

      await expect(repository.settleTransaction(1)).rejects.toThrow('Database error');
    });

    it('存在しない支出IDの場合でもエラーにならないこと', async () => {
      mockDrizzleInstance.execute.mockResolvedValue(undefined);

      await expect(repository.settleTransaction(999)).resolves.not.toThrow();
    });
  });

  describe('updateShare', () => {
    it('負担割合・負担金額の更新が正常に完了すること', async () => {
      mockDrizzleInstance.execute.mockResolvedValue(undefined);
    });

    it('負担割合・負担金額の更新でエラーが発生した場合、エラーがスローされること', async () => {
      mockDrizzleInstance.execute.mockRejectedValue(new Error('Database error'));

      await expect(repository.updateShare(1, 0.5, 500)).rejects.toThrow('Database error');
    });
  });
});
