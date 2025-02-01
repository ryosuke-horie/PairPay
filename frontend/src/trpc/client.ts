import { createTRPCReact } from '@trpc/react-query';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/trpc/router';
import { config, getServerConfig } from '../config/env';

const getBaseUrl = async () => {
  // ブラウザからのリクエスト
  if (typeof window !== 'undefined') {
    // 環境に関係なく、常にバックエンドのURLを使用
    return `${config.backendUrl}/trpc`;
  }

  // サーバーサイドのリクエスト
  try {
    const serverConfig = await getServerConfig();
    return `${serverConfig.backendUrl}/trpc`;
  } catch (error) {
    console.error('Failed to get server config:', error);
    return `${config.backendUrl}/trpc`; 
  }
};

export const api = createTRPCReact<AppRouter>();

export type TRPCClientConfig = {
  url: string;
};

/**
 * tRPCクライアントの初期化関数
 * 非同期でベースURLを取得し、適切な環境に応じた設定を行う
 */
export const initTRPCClient = async (): Promise<{ config: TRPCClientConfig }> => {
  const baseUrl = await getBaseUrl();
  return {
    config: {
      url: baseUrl,
    },
  };
};

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