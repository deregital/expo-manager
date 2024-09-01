'use client';
import ChatSidebar from '@/components/chat/layout/ChatSidebar';
import ChatSidebarMobile from '@/components/chat/layout/ChatSidebarMobile';
import FiltroComp from '@/components/ui/FiltroComp';
import React, { ComponentProps, useState } from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  const [state, setState] = useState<{
    grupoId: string | undefined;
    etiquetasId: string | undefined;
    input: string;
  }>({
    grupoId: undefined,
    etiquetasId: undefined,
    input: '',
  });

  const filtrar: ComponentProps<typeof FiltroComp>['funcionFiltrado'] = ({
    grupoId,
    etiquetasId,
    input,
  }) => {
    return setState({ grupoId, etiquetasId, input });
  };
  return (
    <div className='relative flex h-full'>
      <div className='absolute left-5 top-5 z-20 sm:hidden'>
        <ChatSidebarMobile
          grupoId={state.grupoId}
          etiquetasId={state.etiquetasId}
          input={state.input}
        />
      </div>

      <div className='grid w-full grid-cols-1 grid-rows-1 sm:grid-cols-[auto,1fr]'>
        <div className='hidden h-full w-80 border-r-[3px] border-black/20 bg-sidebar-background sm:block'>
          <ChatSidebar
            grupoId={state.grupoId}
            etiquetasId={state.etiquetasId}
            input={state.input}
          />
        </div>
        <div className='flex flex-col'>
          <div className='border-b-[3px] border-b-black/20'>
            <FiltroComp mostrarEtiq mostrarInput funcionFiltrado={filtrar} />
          </div>
          <div className='flex flex-grow'>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
