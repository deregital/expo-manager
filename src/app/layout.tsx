import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TRPCProvider from '@/app/_trpc/Provider';
import { cn } from '@/lib/utils';
import NextAuthProvider from '@/app/_auth/NextAuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Expo Manager',
  description: 'El mejor administrador de eventos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <NextAuthProvider>
          <TRPCProvider>
            <div className="grid grid-cols-[auto,1fr]">
              <Sidebar />
              <div className="grid grid-rows-[auto,1fr]">
                <Topbar />
                <main className="flex-1 bg-red-500">{children}</main>
              </div>
            </div>
          </TRPCProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
