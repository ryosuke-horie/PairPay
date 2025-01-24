"use client";

import { CreateTransactionDialog } from "@/components/transactions/create-transaction-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TransactionsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 認証チェック
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">取引一覧</h1>
        <CreateTransactionDialog />
      </div>

      {/* 取引一覧は別のコンポーネントとして実装予定 */}
      <div className="space-y-4">
        {/* TransactionList コンポーネントをここに配置 */}
      </div>
    </div>
  );
}