import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import VerificarAuth from '@/components/auth/VerificarAuth';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Expo Manager',
  description: 'El mejor administrador de eventos',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-[auto,1fr]'>
      <div className='hidden md:block'>
        <Sidebar />
      </div>
      <div className='grid grid-rows-[auto,1fr]'>
        <Topbar />
        <main className='h-[calc(100vh-4rem)] flex-1 overflow-y-auto bg-background'>
          <VerificarAuth />
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
};

export default RootLayout;
