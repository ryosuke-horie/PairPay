import type { ITransactionRepository } from '../repositories/transaction.repository';
import type { IUserRepository } from '../repositories/user.repository';

// 未精算取引のリスト
export interface UnSettledTransactionList {
  transactions: {
    id: number;
    payerId: number;
    title: string;
    amount: number;
    firstShare: number;
    secondShare: number;
    transactionDate: Date;
  }[];
}

export interface ISettlementService {
  getUnSettlementList(): Promise<UnSettledTransactionList>;
  settle(settlementId: number): Promise<void>;
}

export class SettlementService implements ISettlementService {
  constructor(
    private transactionRepository: ITransactionRepository,
    private userRepository: IUserRepository
  ) {}

  async getUnSettlementList(): Promise<UnSettledTransactionList> {
    const unSettlementList = await this.transactionRepository.findAllUnSettledTransactions();
    return { transactions: unSettlementList };
  }

  async settle(settlementId: number): Promise<void> {
    await this.transactionRepository.settleTransaction(settlementId);
  }
}
