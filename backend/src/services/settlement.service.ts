import type { ITransactionRepository } from '../repositories/transaction.repository';
import type { IUserRepository } from '../repositories/user.repository';

export interface SettlementStatus {
  amount: number; // プラス：受け取り、マイナス：支払い
}

export interface ISettlementService {
  getSettlementStatus(userId: number): Promise<SettlementStatus>;
}

export class SettlementService implements ISettlementService {
  constructor(
    private transactionRepository: ITransactionRepository,
    private userRepository: IUserRepository
  ) {}

  async getSettlementStatus(userId: number): Promise<SettlementStatus> {
    // ユーザーの存在確認
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 未精算取引の取得
    const transactions = await this.transactionRepository.findAllUnSettledTransactions(userId);

    if (transactions.length === 0) {
      return { amount: 0 };
    }

    // 相手のユーザーIDを抽出し、自分自身との精算をチェック
    const pairUserIds = transactions.reduce<Set<number>>((ids, tx) => {
      if (tx.payerId !== userId) {
        ids.add(tx.payerId);
      }
      return ids;
    }, new Set());

    // 相手が複数いる場合や自分自身との取引のみの場合はエラー
    if (pairUserIds.size !== 1) {
      throw new Error('Cannot calculate settlement with yourself');
    }

    // 残高計算
    const amount = transactions.reduce((acc, tx) => {
      if (tx.payerId === userId) {
        // 自分が支払った場合：相手の負担額を加算
        return acc + tx.partnerShare;
      }
      // 相手が支払った場合：自分の負担額を減算
      return acc - tx.userShare;
    }, 0);

    return { amount };
  }
}
