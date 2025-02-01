'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, useEffect } from 'react';
import { api, initTRPCClient } from './client';
import type { PropsWithChildren } from 'react';

export function TrpcProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient, setTrpcClient] = useState<ReturnType<typeof api.createClient> | null>(null);

  useEffect(() => {
    const initClient = async () => {
      const { config: clientConfig } = await initTRPCClient();
      const client = api.createClient({
        links: [
          httpBatchLink({
            url: clientConfig.url,
            headers() {
              const token = localStorage.getItem('token');
              return {
                Authorization: token ? `Bearer ${token}` : undefined,
              };
            },
          }),
        ],
      });
      setTrpcClient(client);
    };

    initClient().catch(console.error);
  }, []);

  if (!trpcClient) {
    // 初期化中はローディング表示やnullを返す
    // 必要に応じてローディングUIを実装
    return null;
  }

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}