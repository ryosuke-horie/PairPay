"use client";

import { PartnerSettlementCard } from "@/components/settlement/partner-settlement-card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettlementsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // 認証チェック
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // ローディング表示
  if (isLoading) {
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

  // TODO: バックエンドAPIの追加が必要
  // - パートナー一覧を取得するAPI
  // - 全パートナーとの貸し借り状況を一括取得するAPI
  // 現状は仮のデータを使用
  const demoPartners = [
    { id: "1", name: "山田太郎" },
    { id: "2", name: "鈴木花子" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">精算一覧</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demoPartners.map((partner) => (
          <PartnerSettlementCard
            key={partner.id}
            partnerId={partner.id}
            partnerName={partner.name}
          />
        ))}
      </div>
    </div>
  );
}