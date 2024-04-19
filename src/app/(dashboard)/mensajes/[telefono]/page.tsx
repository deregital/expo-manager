'use client';

import EnviarMensajeUI from '@/components/chat/privateChat/EnviarMensajeUI';
import { useParams } from 'next/navigation';
import React from 'react';

interface ChatPageProps {}

const ChatPage = ({}: ChatPageProps) => {
  const { telefono } = useParams<{ telefono: string }>();
  return (
    <div className='flex w-full flex-col'>
      <div className='flex flex-grow'></div>
      <EnviarMensajeUI telefono={telefono} />
    </div>
  );
};

export default ChatPage;
