interface CloudflareEnv {
  NEXT_PUBLIC_BACKEND_URL: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_BACKEND_URL: string;
    }
  }
}
