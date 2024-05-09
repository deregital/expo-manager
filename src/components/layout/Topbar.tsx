import MobileSidebar from '@/components/layout/MobileSidebar';
import SessionMenu from '@/components/layout/SessionMenu';
import { getServerAuthSession } from '@/server/auth';
import React from 'react';

const Topbar = async () => {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return null;
  }

  return (
    <header className='flex h-16 items-center justify-between border-b-[3px] border-black/20 bg-topbar pr-4 md:justify-end'>
      <div className='block md:hidden'>
        <MobileSidebar />
      </div>
      <SessionMenu user={session.user} />
    </header>
  );
};

export default Topbar;
