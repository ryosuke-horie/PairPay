/** @type {import('next').NextConfig} */
const nextConfig = {
    // ESLintを完全に無効化
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
