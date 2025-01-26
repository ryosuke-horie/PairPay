"use client";

import { Card, CardContent } from "@/components/ui/card";

interface SettlementStatusProps {
  amount: number;
}

export const SettlementStatus = ({ amount }: SettlementStatusProps) => {
  const isReceiving = amount > 0;
  const formattedAmount = Math.abs(amount).toLocaleString();

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="text-center text-lg">
          {isReceiving ? (
            <p>
              合計 <span className="font-bold text-green-600">¥{formattedAmount}</span> を受け取る
            </p>
          ) : (
            <p>
              合計 <span className="font-bold text-red-600">¥{formattedAmount}</span> を支払う
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};