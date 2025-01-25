import { type Metadata } from 'next';
import './globals.css';
import { TrpcProvider } from '../trpc/provider';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/header/header';

export const metadata: Metadata = {
  title: 'Share Purse',
  description: 'シンプルな家計簿アプリ',
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
          <main className="relative flex min-h-full flex-col">
            <Header />
            {children}
          </main>
          <Toaster />
        </TrpcProvider>
      </body>
    </html>
  );
}
