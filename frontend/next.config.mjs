/** @type {import('next').NextConfig} */
const nextConfig = {
    // ESLintを完全に無効化
    eslint: {
        ignoreDuringBuilds: true,
    },
    // バックエンドへのプロキシ設定
    rewrites: async () => {
        return [
            {
                source: '/trpc/:path*',
                destination: 'http://127.0.0.1:8787/trpc/:path*', // localhostではなく127.0.0.1を使用
            },
        ];
    },
};

export default nextConfig;
