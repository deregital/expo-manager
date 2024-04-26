'use client';

import EnviarMensajeUI from '@/components/chat/privateChat/EnviarMensajeUI';
import MensajesList from '@/components/chat/privateChat/MensajesList';
import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';
import React from 'react';

interface ChatPageProps {}

const ChatPage = ({}: ChatPageProps) => {
  const { telefono } = useParams<{ telefono: string }>();
  const { data } = trpc.whatsapp.getMessagesByTelefono.useQuery(telefono, {
    enabled: !!telefono,
    refetchInterval: 5000,
  });

  return (
    <div className='relative w-full bg-[url(/img/whatsapp_background.png)]'>
      <div className='flex h-full flex-col'>
        <div className='h-full overflow-y-auto'>
          {data?.mensajes != null && (
            <MensajesList telefono={telefono} mensajes={data?.mensajes ?? []} />
          )}
        </div>
        <EnviarMensajeUI telefono={telefono} inChat={data?.inChat ?? false} />
      </div>
    </div>
  );
};

export default ChatPage;
