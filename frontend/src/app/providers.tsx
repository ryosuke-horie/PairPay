import { TrpcProvider } from "@/trpc/provider";
import { type PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <TrpcProvider>
      {children}
      <Toaster />
    </TrpcProvider>
  );
}