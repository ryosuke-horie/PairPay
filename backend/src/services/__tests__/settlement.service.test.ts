import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ITransactionRepository } from '../../repositories/transaction.repository';
import type { IUserRepository } from '../../repositories/user.repository';
import { SettlementService } from '../settlement.service';

describe('SettlementService', () => {
  // モックリポジトリの作成
  const transactionRepository: ITransactionRepository = {
    findUnSettledTransactions: vi.fn(),
    findAllUnSettledTransactions: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByPayerId: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
    settleTransaction: vi.fn(),
  };

  const userRepository: IUserRepository = {
    create: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
  };

  const settlementService = new SettlementService(transactionRepository, userRepository);

  // 各テスト前にモックをリセット
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getUnSettlementList', () => {
    test('未精算取引がない場合は空の配列を返す', async () => {
      vi.mocked(transactionRepository.findAllUnSettledTransactions).mockResolvedValue([]);

      const result = await settlementService.getUnSettlementList();
      expect(result).toEqual({ transactions: [] });
    });

    test('未精算取引がある場合、全ての取引を返す', async () => {
      const mockTransactions = [
        {
          id: 1,
          payerId: 1,
          title: 'スーパーでの買い物',
          amount: 1000,
          firstShare: 500,
          secondShare: 500,
          transactionDate: new Date('2024-01-01'),
        },
        {
          id: 2,
          payerId: 2,
          title: '交通費',
          amount: 600,
          firstShare: 300,
          secondShare: 300,
          transactionDate: new Date('2024-01-02'),
        },
      ];

      vi.mocked(transactionRepository.findAllUnSettledTransactions).mockResolvedValue(
        mockTransactions
      );

      const result = await settlementService.getUnSettlementList();
      expect(result).toEqual({ transactions: mockTransactions });
    });

    test('取引日の降順でソートされていることを確認', async () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-01-02');

      const mockTransactions = [
        {
          id: 1,
          payerId: 1,
          title: 'スーパーでの買い物',
          amount: 1000,
          firstShare: 500,
          secondShare: 500,
          transactionDate: newDate,
        },
        {
          id: 2,
          payerId: 2,
          title: '交通費',
          amount: 600,
          firstShare: 300,
          secondShare: 300,
          transactionDate: oldDate,
        },
      ];

      vi.mocked(transactionRepository.findAllUnSettledTransactions).mockResolvedValue(
        mockTransactions
      );

      const result = await settlementService.getUnSettlementList();
      expect(result.transactions[0].transactionDate).toEqual(newDate);
      expect(result.transactions[1].transactionDate).toEqual(oldDate);
    });
  });

  // settle メソッドのテストケースを追加
  describe('settle', () => {
    test('正常に精算処理が完了する', async () => {
      const settlementId = 1;
      vi.mocked(transactionRepository.settleTransaction).mockResolvedValue();

      await settlementService.settle(settlementId);

      expect(transactionRepository.settleTransaction).toHaveBeenCalledWith(settlementId);
      expect(transactionRepository.settleTransaction).toHaveBeenCalledTimes(1);
    });

    test('精算処理でエラーが発生した場合、エラーがスローされる', async () => {
      const settlementId = 1;
      const error = new Error('精算処理に失敗しました');
      vi.mocked(transactionRepository.settleTransaction).mockRejectedValue(error);

      await expect(settlementService.settle(settlementId)).rejects.toThrow(error);
    });
  });
});
