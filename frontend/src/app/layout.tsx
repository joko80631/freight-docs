import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CommandPaletteProvider } from '@/components/command-palette-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Freight',
  description: 'Freight management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CommandPaletteProvider>
          {children}
        </CommandPaletteProvider>
        <Toaster />
      </body>
    </html>
  );
} 