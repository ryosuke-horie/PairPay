import { getCloudflareContext } from "@opennextjs/cloudflare";

// SSR時の環境変数取得
export const getServerConfig = async () => {
  try {
    const ctx = await getCloudflareContext();
    return {
      backendUrl: ctx.env.BACKEND_URL as string,
    };
  } catch {
    // ローカル環境またはビルド時
    return {
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787',
    };
  }
};

// クライアントサイドでの環境変数
export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787',
};