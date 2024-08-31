'use client';
import ChatSidebar from '@/components/chat/layout/ChatSidebar';
import ChatSidebarMobile from '@/components/chat/layout/ChatSidebarMobile';
import FiltroComp from '@/components/ui/FiltroComp';
import React, { ComponentProps } from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  const filtrar: ComponentProps<typeof FiltroComp>['funcionFiltrado'] = ({
    grupoId,
    etiquetasId,
    input,
  }) => {
    return [grupoId, etiquetasId, input];
  };
  return (
    <div className='relative flex h-full'>
      <div className='absolute top-5'>
        <FiltroComp mostrarEtiq mostrarInput funcionFiltrado={filtrar} />
      </div>
      <div className='absolute left-5 top-5 z-20 sm:hidden'>
        <ChatSidebarMobile />
      </div>

      <div className='grid w-full grid-cols-1 grid-rows-1 sm:grid-cols-[auto,1fr]'>
        <div className='hidden h-full w-80 border-r-[3px] border-black/20 bg-sidebar-background sm:block'>
          <ChatSidebar
            grupoId={filtrar}
            etiquetasId={filtrar}
            input={filtrar}
          />
        </div>
        <div className='flex flex-grow'>{children}</div>
      </div>
    </div>
  );
};

export default ChatLayout;
