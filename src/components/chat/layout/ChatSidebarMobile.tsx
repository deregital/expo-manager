import ChatSidebar from '@/components/chat/layout/ChatSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import React from 'react';
import { create } from 'zustand';

type ChatSidebarMobileProps = {
  input: string;
  etiquetasId: string | undefined;
  grupoId: string | undefined;
};

export const useChatSidebar = create<{ isOpen: boolean }>((set) => ({
  isOpen: false,
}));

const ChatSidebarMobile = ({
  etiquetasId,
  grupoId,
  input,
}: ChatSidebarMobileProps) => {
  const { isOpen } = useChatSidebar();
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(o) => useChatSidebar.setState({ isOpen: o })}
    >
      <SheetTrigger
        onClick={() => useChatSidebar.setState({ isOpen: true })}
        className='flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm'
      >
        <HamburgerMenuIcon />
      </SheetTrigger>
      <SheetContent className='px-0' side={'left'}>
        <ChatSidebar
          etiquetasId={etiquetasId}
          grupoId={grupoId}
          input={input}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ChatSidebarMobile;
