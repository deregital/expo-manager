'use client';
import ChatSidebar from '@/components/chat/layout/ChatSidebar';
import ChatSidebarMobile from '@/components/chat/layout/ChatSidebarMobile';
import React from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  return (
    <div className='relative flex h-full'>
      <div className='absolute left-5 top-5 sm:hidden'>
        <ChatSidebarMobile />
      </div>

      <div className='hidden h-full w-80 border-r-[3px] border-black/20 bg-sidebar-background sm:block'>
        <ChatSidebar />
      </div>
      <div className='flex flex-grow bg-red-500'>{children}</div>
    </div>
  );
};

export default ChatLayout;
