// 未精算の取引一覧を表示するコンポーネント
import { UnSettlementCard } from "./un-settlement-card";

interface UnSettlementListProps {
  settlements: {
    id: number;
    title: string;
    amount: number;
    transactionDate: string;
    payerId: number;
    firstShare: number;
    secondShare: number;
  }[];
  onUpdateShare: (id: number, shareRatio: number) => Promise<void>;
}

export const UnSettlementList = ({ settlements, onUpdateShare }: UnSettlementListProps) => {
  if (!settlements?.length) {
    return (
      <div className="rounded-lg border border-muted p-4">
        <p className="text-sm text-muted-foreground">
          未精算の取引はありません。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {settlements.map((settlement) => (
        <UnSettlementCard
          key={settlement.id}
          {...settlement}
          onUpdateShare={onUpdateShare}
        />
      ))}
    </div>
  );
};