const getBackendUrl = (): string => {
  // Cloudflare Workersの環境
  if (typeof process === 'undefined') {
    // @ts-expect-error: env will be injected by CloudflareWorkers
    return env.BACKEND_URL;
  }

  // Next.jsの環境（ローカル開発環境を含む）
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
};

export const config = {
  backendUrl: getBackendUrl(),
};