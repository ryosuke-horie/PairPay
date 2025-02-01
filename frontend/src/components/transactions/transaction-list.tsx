import { api } from "@/trpc/client";
import { TransactionCard } from "./transaction-card";

interface Transaction {
  id: number;
  title: string;
  amount: number;
  transactionDate: string;
  payerId: number;
}

export const TransactionList = () => {
  const { data, isLoading, error } = api.transaction.list.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-4">
        <p className="text-sm text-destructive">
          支出データの取得に失敗しました。
        </p>
      </div>
    );
  }

  if (!data?.transactions.length) {
    return (
      <div className="rounded-lg border border-muted p-4">
        <p className="text-sm text-muted-foreground">
          支出データがありません。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {data.transactions.map((transaction: Transaction) => (
        <TransactionCard
          key={transaction.id}
          id={transaction.id}
          title={transaction.title}
          amount={transaction.amount}
          transactionDate={new Date(transaction.transactionDate)}
        />
      ))}
    </div>
  );
};