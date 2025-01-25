import { type Metadata } from 'next';
import './globals.css';
import { TrpcProvider } from '../trpc/provider';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/header/header';

export const metadata: Metadata = {
  title: '共同家計簿',
  description: '共同家計簿',
};

// フォントのローカルスタイル定義
const fontClass = 'font-geist';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${fontClass} relative h-full`}>
        <TrpcProvider>
          <main className="relative flex min-h-full flex-col bg-background">
            <Header />
            <div className="flex-1 px-2 pb-safe-area-inset-bottom sm:px-4">
              {children}
            </div>
          </main>
          <Toaster />
        </TrpcProvider>
      </body>
    </html>
  );
}
