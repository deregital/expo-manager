import SessionMenu from '@/components/layout/SessionMenu';
import React from 'react';

const Topbar = () => {
  return (
    <header className="flex h-16 items-center justify-end bg-lime-500 pr-4">
      <SessionMenu />
    </header>
  );
};

export default Topbar;
