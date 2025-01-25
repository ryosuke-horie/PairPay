import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatJPY } from "@/lib/utils";

interface TransactionCardProps {
  title: string;
  amount: number;
  transactionDate: Date;
  payerName: string;
}

export const TransactionCard = ({
  title,
  amount,
  transactionDate,
  payerName,
}: TransactionCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{payerName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{formatJPY(amount)}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(transactionDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};