'use client';
import ChatSidebar from '@/components/chat/layout/ChatSidebar';
import React from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  return (
    <div className='grid h-full grid-cols-[auto,1fr]'>
      <div className='h-full w-80 border-r-[3px] border-black/20 bg-sidebar-background'>
        <ChatSidebar />
      </div>
      <div className='flex flex-grow bg-red-500'>{children}</div>
    </div>
  );
};

export default ChatLayout;
