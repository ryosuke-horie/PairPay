"use client";

import { useAuth } from "@/hooks/use-auth";
import { api } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UnSettlementList } from "@/components/settlement/un-settlement-list";
import { useToast } from "@/hooks/use-toast";

export default function SettlementsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();
  const updateShareMutation = api.settlement.updateShare.useMutation();

  // tRPCのクエリ
  const { data: settlements, isLoading: isSettlementsLoading, error } = 
    api.settlement.getUnSettlementList.useQuery(undefined, {
      enabled: isAuthenticated,
      retry: 1,
    });

  // 認証チェック
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // ローディング表示
  if (isLoading || isSettlementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // 未認証
  if (!isAuthenticated || !user) {
    return null;
  }

  // エラー表示
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">
          {error.message || "エラーが発生しました"}
        </div>
      </div>
    );
  }

  const handleUpdateShare = async (id: number, shareRatio: number) => {
    try {
      const settlement = settlements?.transactions.find(t => t.id === id);
      const shareAmount = settlement ? Math.round(settlement.amount * shareRatio) : 0;
      
      await updateShareMutation.mutateAsync({
        settlementId: id,
        shareRatio,
        shareAmount,
      });
      toast({
        description: '負担割合を更新しました',
      });
      await utils.settlement.getUnSettlementList.invalidate();
    } catch (error) {
      toast({
        variant: 'destructive',
        description: '更新中にエラーが発生しました。再度お試しください',
      });
    }
  };

  return (
    <div className="container max-w-screen-md py-6">
      <h1 className="mb-6 text-2xl font-bold">未精算管理</h1>
      <UnSettlementList 
        settlements={settlements?.transactions ?? []} 
        onUpdateShare={handleUpdateShare}
      />
    </div>
  );
}