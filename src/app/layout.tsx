import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TRPCProvider from '@/app/_trpc/Provider';
import { cn } from '@/lib/utils';
import NextAuthProvider from '@/app/_auth/NextAuthProvider';

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
          <TRPCProvider>{children}</TRPCProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
