"use client";

import { SettlementStatus } from "@/components/settlement/settlement-status";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettlementsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // tRPCのクエリ
  const settlementQuery = api.settlement.getStatus.useQuery(undefined, {
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
  if (isLoading || settlementQuery.isLoading) {
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
  if (settlementQuery.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">
          {settlementQuery.error.message || "エラーが発生しました"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">精算状況</h1>
      <div className="max-w-md mx-auto">
        <SettlementStatus amount={settlementQuery.data?.amount ?? 0} />
      </div>
    </div>
  );
}