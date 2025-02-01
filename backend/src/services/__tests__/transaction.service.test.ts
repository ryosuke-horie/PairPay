import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ITransactionRepository,
  TransactionCreateInput,
  TransactionResponse,
} from '../../repositories/transaction.repository';
import type { IUserRepository } from '../../repositories/user.repository';
import type { UserResponse } from '../../types';
import { TransactionService } from '../transaction.service';

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
  findAll: Mock;
  delete: Mock;
} = {
  create: vi.fn(),
  findById: vi.fn(),
  findByPayerId: vi.fn(),
  findAll: vi.fn(),
  delete: vi.fn(),
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
      title: 'スーパーでの買い物',
      amount: 1000,
      transactionDate: new Date('2024-01-24'),
    };

    it('正常に支出を作成できること', async () => {
      // ユーザーの存在確認のモック
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await service.createTransaction(validInput);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(validInput.payerId);
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(validInput);
    });

    it('タイトルが空の場合エラーをスローすること', async () => {
      const invalidInput = {
        ...validInput,
        title: '',
      };

      await expect(service.createTransaction(invalidInput)).rejects.toThrow('Title is required');
      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('タイトルが空白文字のみの場合エラーをスローすること', async () => {
      const invalidInput = {
        ...validInput,
        title: '   ',
      };

      await expect(service.createTransaction(invalidInput)).rejects.toThrow('Title is required');
      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('存在しないユーザーIDの場合エラーをスローすること', async () => {
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(service.createTransaction(validInput)).rejects.toThrow('User not found');
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

    it('支出日が未来の場合エラーをスローすること', async () => {
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
    it('ユーザーの支出履歴を取得できること', async () => {
      const mockTransactions: TransactionResponse[] = [
        {
          id: 1,
          payerId: 1,
          title: 'スーパーでの買い物',
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

      await expect(service.getTransactionsByPayerId(999)).rejects.toThrow('User not found');
      expect(mockTransactionRepository.findByPayerId).not.toHaveBeenCalled();
    });
  });

  describe('getAllTransactions', () => {
    it('全ての支出履歴を取得できること', async () => {
      const mockTransactions: TransactionResponse[] = [
        {
          id: 1,
          payerId: 1,
          title: 'スーパーでの買い物',
          amount: 1000,
          transactionDate: new Date('2024-01-24'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          payerId: 2,
          title: '食材の買い出し',
          amount: 2000,
          transactionDate: new Date('2024-01-25'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTransactionRepository.findAll.mockResolvedValue(mockTransactions);

      const result = await service.getAllTransactions();

      expect(mockTransactionRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTransactions);
    });

    it('支出が存在しない場合は空配列を返すこと', async () => {
      mockTransactionRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllTransactions();

      expect(result).toEqual([]);
    });

    describe('deleteTransaction', () => {
      const mockTransaction: TransactionResponse = {
        id: 1,
        payerId: 1,
        title: 'Test Transaction',
        amount: 1000,
        transactionDate: new Date('2024-01-24'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('正常に支出を削除できること', async () => {
        // 支出の存在確認のモック
        mockTransactionRepository.findById.mockResolvedValue(mockTransaction);
        mockTransactionRepository.delete.mockResolvedValue(undefined);

        await service.deleteTransaction(1, 1);

        expect(mockTransactionRepository.findById).toHaveBeenCalledWith(1);
        expect(mockTransactionRepository.delete).toHaveBeenCalledWith(1);
      });

      it('存在しない支出の場合エラーをスローすること', async () => {
        mockTransactionRepository.findById.mockResolvedValue(undefined);

        await expect(service.deleteTransaction(999, 1)).rejects.toThrow(
          '指定された支出が見つかりません'
        );
        expect(mockTransactionRepository.delete).not.toHaveBeenCalled();
      });
    });
  });
});
