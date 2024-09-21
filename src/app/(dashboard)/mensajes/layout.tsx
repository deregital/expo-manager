'use client';
import ChatSidebar from '@/components/chat/layout/ChatSidebar';
import ChatSidebarMobile from '@/components/chat/layout/ChatSidebarMobile';
import Filtro from '@/components/ui/filtro/Filtro';
import {
  type Filtro as FiltroType,
  FuncionFiltrar,
  defaultFilter,
} from '@/lib/filter';
import React, { useState } from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  const [filtro, setFiltro] = useState<FiltroType>(defaultFilter);

  const filtrar: FuncionFiltrar = (filter) => {
    return setFiltro(filter);
  };

  return (
    <div className='relative flex h-full'>
      <div className='absolute left-5 top-5 z-20 sm:hidden'>
        <ChatSidebarMobile filtro={filtro} />
      </div>

      <div className='grid w-full grid-cols-1 grid-rows-1 sm:grid-cols-[auto,1fr]'>
        <div className='hidden h-full w-80 border-r-[3px] border-black/20 bg-sidebar-background sm:block'>
          <ChatSidebar filtro={filtro} />
        </div>
        <div className='flex flex-col'>
          <div className='border-b-[3px] border-b-black/20'>
            <Filtro mostrarEtiq mostrarInput funcionFiltrado={filtrar} />
          </div>
          <div className='flex max-h-full flex-grow overflow-y-auto'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
