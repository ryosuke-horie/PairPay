import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ITransactionRepository } from '../../repositories/transaction.repository';
import type { IUserRepository } from '../../repositories/user.repository';
import { SettlementService } from '../settlement.service';

describe('SettlementService', () => {
  // モックリポジトリの作成
  const transactionRepository: ITransactionRepository = {
    findUnSettledTransactions: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByPayerId: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
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

  describe('getSettlementStatus', () => {
    test('正常系: 未精算取引がない場合は0を返す', async () => {
      // モックの設定
      vi.mocked(userRepository.findById)
        .mockResolvedValueOnce({ id: 1, name: 'User 1', email: 'user1@example.com' })
        .mockResolvedValueOnce({ id: 2, name: 'User 2', email: 'user2@example.com' });
      vi.mocked(transactionRepository.findUnSettledTransactions).mockResolvedValue([]);

      const status = await settlementService.getSettlementStatus(1, 2);
      expect(status).toEqual({ amount: 0 });
    });

    test('正常系: 自分が支払った取引の場合', async () => {
      // モックの設定
      vi.mocked(userRepository.findById)
        .mockResolvedValueOnce({ id: 1, name: 'User 1', email: 'user1@example.com' })
        .mockResolvedValueOnce({ id: 2, name: 'User 2', email: 'user2@example.com' });
      vi.mocked(transactionRepository.findUnSettledTransactions).mockResolvedValue([
        {
          id: 1,
          payerId: 1, // 自分が支払い
          amount: 1000,
          userShare: 500,
          partnerShare: 500,
          transactionDate: new Date(),
        },
      ]);

      const status = await settlementService.getSettlementStatus(1, 2);
      expect(status).toEqual({ amount: 500 }); // 相手の負担額を受け取る
    });

    test('正常系: 相手が支払った取引の場合', async () => {
      // モックの設定
      vi.mocked(userRepository.findById)
        .mockResolvedValueOnce({ id: 1, name: 'User 1', email: 'user1@example.com' })
        .mockResolvedValueOnce({ id: 2, name: 'User 2', email: 'user2@example.com' });
      vi.mocked(transactionRepository.findUnSettledTransactions).mockResolvedValue([
        {
          id: 1,
          payerId: 2, // 相手が支払い
          amount: 1000,
          userShare: 500,
          partnerShare: 500,
          transactionDate: new Date(),
        },
      ]);

      const status = await settlementService.getSettlementStatus(1, 2);
      expect(status).toEqual({ amount: -500 }); // 自分の負担額を支払う
    });

    test('正常系: 複数の取引がある場合', async () => {
      // モックの設定
      vi.mocked(userRepository.findById)
        .mockResolvedValueOnce({ id: 1, name: 'User 1', email: 'user1@example.com' })
        .mockResolvedValueOnce({ id: 2, name: 'User 2', email: 'user2@example.com' });
      vi.mocked(transactionRepository.findUnSettledTransactions).mockResolvedValue([
        {
          id: 1,
          payerId: 1,
          amount: 1000,
          userShare: 500,
          partnerShare: 500,
          transactionDate: new Date(),
        },
        {
          id: 2,
          payerId: 2,
          amount: 600,
          userShare: 300,
          partnerShare: 300,
          transactionDate: new Date(),
        },
      ]);

      const status = await settlementService.getSettlementStatus(1, 2);
      expect(status).toEqual({ amount: 200 }); // 500 - 300
    });

    test('異常系: ユーザーが存在しない場合', async () => {
      // モックの設定
      vi.mocked(userRepository.findById)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ id: 2, name: 'User 2', email: 'user2@example.com' });

      await expect(settlementService.getSettlementStatus(1, 2)).rejects.toThrow('User not found');
    });

    test('異常系: 自分自身との精算を試みた場合', async () => {
      // モックの設定
      vi.mocked(userRepository.findById).mockResolvedValue({
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
      });

      await expect(settlementService.getSettlementStatus(1, 1)).rejects.toThrow(
        'Cannot calculate settlement with yourself'
      );
    });
  });
});
