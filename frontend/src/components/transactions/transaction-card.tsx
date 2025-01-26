import { useTransition } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatJPY } from '@/lib/utils';
import { api } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';

interface TransactionCardProps {
  title: string;
  amount: number;
  transactionDate: Date;
  id: number;
}

export const TransactionCard = ({
  title,
  amount,
  transactionDate,
  id,
}: TransactionCardProps) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const utils = api.useUtils();
  const deleteMutation = api.transaction.delete.useMutation();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteMutation.mutateAsync({ transactionId: id });
        toast({
          description: '取引を削除しました',
        });
        // トランザクション一覧を更新
        await utils.transaction.list.invalidate();
        // 未精算一覧も更新する
        await utils.settlement.getUnSettlementList.invalidate();
      } catch (error) {
        toast({
          variant: 'destructive',
          description: '削除中にエラーが発生しました。再度お試しください',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-base font-semibold sm:text-sm">{title}</h4>
          </div>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-base font-medium sm:text-sm">{formatJPY(amount)}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(transactionDate).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isPending}
              className="h-10 w-10 sm:h-8 sm:w-8"
            >
              <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};