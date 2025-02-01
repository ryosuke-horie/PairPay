import type { ITransactionRepository } from '../repositories/transaction.repository';

// 未精算支出のリスト
export interface UnSettledTransactionList {
  transactions: {
    id: number;
    payerId: number;
    title: string;
    amount: number;
    firstShare: number;
    secondShare: number;
    firstShareRatio: number;
    secondShareRatio: number;
    transactionDate: Date;
  }[];
}

export interface ISettlementService {
  getUnSettlementList(): Promise<UnSettledTransactionList>;
  settle(settlementId: number): Promise<void>;
  updateShare(settlementId: number, shareRatio: number, shareAmount: number): Promise<void>;
}

export class SettlementService implements ISettlementService {
  constructor(private transactionRepository: ITransactionRepository) {}

  async getUnSettlementList(): Promise<UnSettledTransactionList> {
    const unSettlementList = await this.transactionRepository.findAllUnSettledTransactions();
    return { transactions: unSettlementList };
  }

  async settle(settlementId: number): Promise<void> {
    await this.transactionRepository.settleTransaction(settlementId);
  }

  async updateShare(settlementId: number, shareRatio: number, shareAmount: number): Promise<void> {
    await this.transactionRepository.updateShare(settlementId, shareRatio, shareAmount);
  }
}
