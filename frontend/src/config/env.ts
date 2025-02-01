import { getCloudflareContext } from "@opennextjs/cloudflare";

// デフォルトのバックエンドURL設定
const DEFAULT_BACKEND_URL = 'https://pair-pay.work';
const DEVELOPMENT_BACKEND_URL = 'http://localhost:8787';

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
        (process.env.NODE_ENV === 'development' ? DEVELOPMENT_BACKEND_URL : DEFAULT_BACKEND_URL),
    };
  }
};

// クライアントサイドでの環境変数
export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === 'development' ? DEVELOPMENT_BACKEND_URL : DEFAULT_BACKEND_URL),
};