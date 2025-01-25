/** @type {import('next').NextConfig} */
const nextConfig = {
    // ESLintを完全に無効化
    eslint: {
        ignoreDuringBuilds: true,
    },
    // 環境変数をクライアントに公開
    env: {
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    },
    // バックエンドへのプロキシ設定
    rewrites: async () => {
        // 開発環境の場合のみローカルプロキシを設定
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/trpc/:path*',
                    destination: 'http://127.0.0.1:8787/trpc/:path*',
                },
            ];
        }
        return [];
    },
};

export default nextConfig;
