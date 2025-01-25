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
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{title}</h4>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{formatJPY(amount)}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(transactionDate).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isPending}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};