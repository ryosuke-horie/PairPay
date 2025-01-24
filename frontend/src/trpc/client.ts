import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/trpc/router';
import { config } from '../config/env';

const getBaseUrl = () => {
  // 開発環境とブラウザからのリクエスト
  if (typeof window !== 'undefined') {
    return '/api/trpc';
  }

  // サーバーサイドのリクエスト
  return `${config.backendUrl}/trpc`;
};

export const api = createTRPCReact<AppRouter>();

// 型のエクスポート
export type { AppRouter };

// ルーター入力の型を抽出
export type RouterInputs = inferRouterInputs<AppRouter>;
// ルーター出力の型を抽出
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type RouterTypes = {
  inputs: RouterInputs;
  outputs: RouterOutputs;
};