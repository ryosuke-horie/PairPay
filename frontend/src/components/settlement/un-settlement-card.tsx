import { useTransition } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { formatJPY } from '@/lib/utils';
import { api } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';

interface UnSettlementCardProps {
  id: number;
  amount: number;
  transactionDate: string;
  payerId: number;
  firstShare: number;
  secondShare: number;
}

export const UnSettlementCard = (props: UnSettlementCardProps) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const utils = api.useUtils();
  const settleMutation = api.settlement.settle.useMutation();

  const handleSettle = () => {
    startTransition(async () => {
      try {
        await settleMutation.mutateAsync({ settlementId: props.id });
        toast({
          description: '精算を完了しました',
        });
        await utils.settlement.getUnSettlementList.invalidate();
      } catch (error) {
        toast({
          variant: 'destructive',
          description: '精算処理中にエラーが発生しました。再度お試しください',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              ユーザー{props.payerId}から支払い
            </p>
          </div>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-base font-medium sm:text-sm">{formatJPY(props.amount)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSettle}
              disabled={isPending}
              className="h-10 w-10 sm:h-8 sm:w-8"
            >
              <Check className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}; 