import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

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
    <div className="grid grid-cols-[auto,1fr]">
      <Sidebar />
      <div className="grid grid-rows-[auto,1fr]">
        <Topbar />
        <main className="h-[calc(100vh-4rem)] flex-1 bg-red-500">
          {children}
        </main>
      </div>
    </div>
  );
}
