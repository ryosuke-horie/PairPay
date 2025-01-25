import type {
  ITransactionRepository,
  TransactionCreateInput,
  TransactionResponse,
} from '../repositories/transaction.repository';
import type { IUserRepository } from '../repositories/user.repository';

export interface ITransactionService {
  createTransaction(data: TransactionCreateInput): Promise<void>;
  getTransactionsByPayerId(payerId: number): Promise<TransactionResponse[]>;
  getAllTransactions(): Promise<TransactionResponse[]>;
  deleteTransaction(transactionId: number, userId: number): Promise<void>;
}

export class TransactionService implements ITransactionService {
  constructor(
    private transactionRepository: ITransactionRepository,
    private userRepository: IUserRepository
  ) {}

  async createTransaction(data: TransactionCreateInput): Promise<void> {
    // 入力値のバリデーション（先に実行）
    // タイトルの検証
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    // 金額の検証
    if (data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // 取引日の検証
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transactionDate = new Date(data.transactionDate);
    transactionDate.setHours(0, 0, 0, 0);

    if (transactionDate > today) {
      throw new Error('Transaction date cannot be in the future');
    }

    // ユーザーの存在確認（バリデーション後に実行）
    const user = await this.userRepository.findById(data.payerId);
    if (!user) {
      throw new Error('User not found');
    }

    // 取引の作成
    await this.transactionRepository.create(data);
  }

  async getTransactionsByPayerId(payerId: number): Promise<TransactionResponse[]> {
    // ユーザーの存在確認
    const user = await this.userRepository.findById(payerId);
    if (!user) {
      throw new Error('User not found');
    }

    // 取引履歴の取得
    return await this.transactionRepository.findByPayerId(payerId);
  }

  async getAllTransactions(): Promise<TransactionResponse[]> {
    // 全ての取引履歴を取得
    return await this.transactionRepository.findAll();
  }

  async deleteTransaction(transactionId: number, userId: number): Promise<void> {
    // 取引の存在確認
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new Error('指定された取引が見つかりません');
    }

    // 取引の削除
    await this.transactionRepository.delete(transactionId);
  }
}
