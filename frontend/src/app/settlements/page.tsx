"use client";

import { useAuth } from "@/hooks/use-auth";
import { api } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UnSettlementList } from "@/components/settlement/un-settlement-list";

export default function SettlementsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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

  return (
    <div className="container max-w-screen-md py-6">
      <h1 className="mb-6 text-2xl font-bold">未精算一覧</h1>
      <UnSettlementList settlements={settlements?.transactions ?? []} />
    </div>
  );
}