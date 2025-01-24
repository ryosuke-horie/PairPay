import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { IUserRepository } from '../../repositories/user.repository';
import type {
  ITransactionRepository,
  TransactionCreateInput,
  TransactionResponse,
} from '../../repositories/transaction.repository';
import { TransactionService } from '../transaction.service';
import type { UserResponse } from '../../types';

// モックユーザーデータ
const mockUser: UserResponse = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
};

// モックリポジトリの作成
const mockTransactionRepository: {
  create: Mock;
  findById: Mock;
  findByPayerId: Mock;
} = {
  create: vi.fn(),
  findById: vi.fn(),
  findByPayerId: vi.fn(),
};

const mockUserRepository: {
  findById: Mock;
  findByEmail: Mock;
  create: Mock;
} = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  create: vi.fn(),
};

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TransactionService(
      mockTransactionRepository as unknown as ITransactionRepository,
      mockUserRepository as unknown as IUserRepository
    );
  });

  describe('createTransaction', () => {
    const validInput: TransactionCreateInput = {
      payerId: 1,
      amount: 1000,
      transactionDate: new Date('2024-01-24'),
    };

    it('正常に取引を作成できること', async () => {
      // ユーザーの存在確認のモック
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await service.createTransaction(validInput);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(validInput.payerId);
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(validInput);
    });

    it('存在しないユーザーIDの場合エラーをスローすること', async () => {
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(service.createTransaction(validInput)).rejects.toThrow(
        'User not found'
      );
      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('金額が0以下の場合エラーをスローすること', async () => {
      const invalidInput = {
        ...validInput,
        amount: 0,
      };

      await expect(service.createTransaction(invalidInput)).rejects.toThrow(
        'Amount must be greater than 0'
      );
      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('取引日が未来の場合エラーをスローすること', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidInput = {
        ...validInput,
        transactionDate: futureDate,
      };

      await expect(service.createTransaction(invalidInput)).rejects.toThrow(
        'Transaction date cannot be in the future'
      );
      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getTransactionsByPayerId', () => {
    it('ユーザーの取引履歴を取得できること', async () => {
      const mockTransactions: TransactionResponse[] = [
        {
          id: 1,
          payerId: 1,
          amount: 1000,
          transactionDate: new Date('2024-01-24'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTransactionRepository.findByPayerId.mockResolvedValue(mockTransactions);

      const result = await service.getTransactionsByPayerId(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTransactionRepository.findByPayerId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTransactions);
    });

    it('存在しないユーザーIDの場合エラーをスローすること', async () => {
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(service.getTransactionsByPayerId(999)).rejects.toThrow(
        'User not found'
      );
      expect(mockTransactionRepository.findByPayerId).not.toHaveBeenCalled();
    });
  });
});