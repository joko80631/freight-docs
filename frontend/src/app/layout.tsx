import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RootProvider } from '@/components/providers/root-provider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Freight SaaS Dashboard',
  description: 'Your freight operations management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootProvider>{children}</RootProvider>
        <Toaster 
          position="top-right"
          richColors 
          closeButton
          theme="system"
          duration={4000}
          visibleToasts={6}
          hotkey={['altKey', 'KeyT']}
          style={{ zIndex: 100 }}
        />
      </body>
    </html>
  );
} 