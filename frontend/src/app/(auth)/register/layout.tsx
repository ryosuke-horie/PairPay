import { getServerConfig } from '@/config/env';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function RegisterLayout({ children }: LayoutProps) {
  const config = await getServerConfig();

  return (
    <div
      data-backend-url={config.backendUrl}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-lg dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}