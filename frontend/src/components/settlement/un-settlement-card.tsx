import { useTransition, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Pencil } from 'lucide-react';
import { formatJPY } from '@/lib/utils';
import { api } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { EditSettlementDialog } from './edit-settlement-dialog';

interface UnSettlementCardProps {
  id: number;
  title: string;
  amount: number;
  transactionDate: string;
  payerId: number;
  firstShare: number;
  secondShare: number;
  firstShareRatio: number;
  secondShareRatio: number;
  onUpdateShare: (id: number, shareRatio: number) => Promise<void>;
}

export const UnSettlementCard = (props: UnSettlementCardProps) => {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    <>
      <Card>
        <CardHeader 
          className="p-3 sm:p-4 cursor-pointer" 
          onClick={() => setIsDialogOpen(true)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold sm:text-sm">{props.title}</p>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-end gap-3 sm:gap-4">
              <div className="text-right">
                <p className="text-base font-medium sm:text-sm">{formatJPY(props.amount)}</p>
                <p className="text-sm text-muted-foreground">
                  支払う額: {formatJPY(props.firstShare)}
                </p>
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
      <EditSettlementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={props.title}
        currentShareRatio={props.secondShareRatio}
        totalAmount={props.amount}
        onSubmit={async (shareRatio) => {
          await props.onUpdateShare(props.id, shareRatio);
        }}
      />
    </>
  );
}; 