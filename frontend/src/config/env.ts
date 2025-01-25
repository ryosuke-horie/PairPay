import { getCloudflareContext } from "@opennextjs/cloudflare";

// デフォルトのバックエンドURL（本番環境用）
const DEFAULT_BACKEND_URL = 'https://share-purse-backend.ryosuke-horie37.workers.dev';

// SSR時の環境変数取得
export const getServerConfig = async () => {
  try {
    const ctx = await getCloudflareContext();
    return {
      backendUrl: ctx.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL,
    };
  } catch {
    // ローカル環境またはビルド時
    return {
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ||
        (process.env.NODE_ENV === 'development' ? 'http://localhost:8787' : DEFAULT_BACKEND_URL),
    };
  }
};

// クライアントサイドでの環境変数
export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8787' : DEFAULT_BACKEND_URL),
};