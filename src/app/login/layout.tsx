import { getServerAuthSession } from '@/server/auth';
import { redirect } from 'next/navigation';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  const session = await getServerAuthSession();
  if (session && session.user) {
    return redirect('/');
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-white font-sans antialiased'>
      {children}
    </div>
  );
};

export default Layout;
