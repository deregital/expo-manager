import SessionMenu from '@/components/layout/SessionMenu';
import React from 'react';

const Topbar = () => {
  return (
    <header className='flex h-16 items-center justify-end border-b-[3px] border-black/20 bg-topbar pr-4'>
      <SessionMenu />
    </header>
  );
};

export default Topbar;
