'use client';

import EnviarMensajeUI from '@/components/chat/privateChat/EnviarMensajeUI';
import MensajesList from '@/components/chat/privateChat/MensajesList';
import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';
import React from 'react';

interface ChatPageProps {}

const ChatPage = ({}: ChatPageProps) => {
  const { telefono } = useParams<{ telefono: string }>();
  const { data } = trpc.whatsapp.getMessagesByTelefono.useQuery(telefono);

  return (
    <div className='relative flex w-full flex-col bg-[#EFEBE2]'>
      <div className='absolute inset-0 bg-[url(/img/whatsapp_background.png)] opacity-40'></div>
      <div className='flex flex-grow'>
        {(() => {
          if (data?.mensajes != null) {
            return <MensajesList from={telefono} mensajes={data?.mensajes} />;
          }
        })()}
      </div>
      <EnviarMensajeUI telefono={telefono} inChat={data?.inChat ?? false} />
    </div>
  );
};

export default ChatPage;
