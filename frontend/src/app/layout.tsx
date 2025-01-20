import { type Metadata } from 'next';
import './globals.css';
import { TrpcProvider } from '../trpc/provider';
import { Toaster } from '@/components/ui/sonner';

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
    <html lang="ja">
      <body className={fontClass}>
        <TrpcProvider>
          {children}
          <Toaster />
        </TrpcProvider>
      </body>
    </html>
  );
}
