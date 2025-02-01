"use client";

import { CreateTransactionDialog } from "@/components/transactions/create-transaction-dialog";
import { TransactionList } from "@/components/transactions/transaction-list";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TransactionsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // 認証チェック
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="py-4 sm:py-6">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-3xl">支出管理</h1>
        <CreateTransactionDialog />
      </div>

      <TransactionList />
    </div>
  );
}