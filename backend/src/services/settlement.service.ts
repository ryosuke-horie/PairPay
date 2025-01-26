import type { ITransactionRepository } from '../repositories/transaction.repository';
import type { IUserRepository } from '../repositories/user.repository';

export interface SettlementStatus {
  amount: number; // プラス：受け取り、マイナス：支払い
}

export interface ISettlementService {
  getSettlementStatus(userId: number, partnerId: number): Promise<SettlementStatus>;
}

export class SettlementService implements ISettlementService {
  constructor(
    private transactionRepository: ITransactionRepository,
    private userRepository: IUserRepository
  ) {}

  async getSettlementStatus(userId: number, partnerId: number): Promise<SettlementStatus> {
    // ユーザーの存在確認
    const [user, partner] = await Promise.all([
      this.userRepository.findById(userId),
      this.userRepository.findById(partnerId),
    ]);

    if (!user || !partner) {
      throw new Error('User not found');
    }

    // 自分自身との精算は不可
    if (userId === partnerId) {
      throw new Error('Cannot calculate settlement with yourself');
    }

    // 未精算取引の取得
    const transactions = await this.transactionRepository.findUnSettledTransactions(
      userId,
      partnerId
    );

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
