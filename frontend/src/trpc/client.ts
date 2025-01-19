import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/index.js';
import { config } from '../config/env';

const getBaseUrl = () => {
  // 開発環境とブラウザからのリクエスト
  if (typeof window !== 'undefined') {
    return '/trpc';
  }

  // サーバーサイドのリクエスト
  return `${config.backendUrl}/trpc`;
};

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getBaseUrl(),
      headers() {
        if (typeof window === 'undefined') return {};

        const token = localStorage.getItem('token');
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
});

// ルーター入力の型を抽出
export type RouterInputs = inferRouterInputs<AppRouter>;
// ルーター出力の型を抽出
export type RouterOutputs = inferRouterOutputs<AppRouter>;