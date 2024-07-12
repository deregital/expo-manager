import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import VerificarAuth from '@/components/auth/VerificarAuth';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Expo Manager',
  description: 'El mejor administrador de eventos',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const esDemo = process.env.NEXT_PUBLIC_ES_DEMO === 'true';

  return (
    <div className='grid grid-cols-1 md:grid-cols-[auto,1fr]'>
      <div className='hidden md:block'>
        <Sidebar />
      </div>
      <div className='grid grid-rows-[auto,1fr]'>
        <Topbar />
        <main
          className={cn(
            'h-[calc(100vh-4rem)] flex-1 overflow-y-auto',
            esDemo ? 'bg-[#fff5ef]' : ' bg-background'
          )}
        >
          <VerificarAuth />
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
};

export default RootLayout;
