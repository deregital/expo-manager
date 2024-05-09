'use client';

import Sidebar from '@/components/layout/Sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import React from 'react';
import { create } from 'zustand';

interface MobileSidebarProps {}

export const useSidebar = create<{ isOpen: boolean }>(() => ({
  isOpen: false,
}));

const MobileSidebar = ({}: MobileSidebarProps) => {
  const { isOpen } = useSidebar();
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(o) => useSidebar.setState({ isOpen: o })}
    >
      <SheetTrigger
        onClick={() => useSidebar.setState({ isOpen: true })}
        className='flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm'
      >
        <HamburgerMenuIcon />
      </SheetTrigger>
      <SheetContent className='h-full w-fit px-0 py-0' side={'left'}>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
