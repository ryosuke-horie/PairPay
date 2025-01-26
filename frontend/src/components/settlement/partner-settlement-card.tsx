"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/trpc/client";

interface PartnerSettlementCardProps {
  partnerId: string;
  partnerName: string;
}

export const PartnerSettlementCard = ({
  partnerId,
  partnerName,
}: PartnerSettlementCardProps) => {
  const settlementQuery = api.settlement.getStatus.useQuery(
    { partnerId },
    {
      retry: 1,
    }
  );

  // ローディング表示
  if (settlementQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{partnerName}さんとの貸し借り</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // エラー表示
  if (settlementQuery.error) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{partnerName}さんとの貸し借り</h3>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            {settlementQuery.error.message || "エラーが発生しました"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const amount = settlementQuery.data?.amount ?? 0;
  const isReceiving = amount > 0;
  const formattedAmount = Math.abs(amount).toLocaleString();

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{partnerName}さんとの貸し借り</h3>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {isReceiving ? (
            <p>
              <span className="font-bold text-green-600">¥{formattedAmount}</span>{" "}
              受け取る
            </p>
          ) : (
            <p>
              <span className="font-bold text-red-600">¥{formattedAmount}</span>{" "}
              支払う
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};