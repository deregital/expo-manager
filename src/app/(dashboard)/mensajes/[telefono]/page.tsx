'use client';

import ChatTopbar from '@/components/chat/privateChat/ChatTopbar';
import EnviarMensajeUI from '@/components/chat/privateChat/EnviarMensajeUI';
import MensajesList from '@/components/chat/privateChat/MensajesList';
import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';

interface ChatPageProps {}

const ChatPage = ({}: ChatPageProps) => {
  const { telefono } = useParams<{ telefono: string }>();
  const { data } = trpc.whatsapp.getMessagesByTelefono.useQuery(telefono, {
    enabled: !!telefono,
    refetchInterval: 5000,
  });

  const { mutateAsync: leerMensajes } =
    trpc.whatsapp.readMensajes.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    async function leerMensajitos() {
      await leerMensajes(telefono);
      utils.whatsapp.mensajesNoLeidos.invalidate();
      utils.modelo.getAllWithInChat.invalidate();
    }
    leerMensajitos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telefono]);

  return (
    <div className='relative w-full bg-[url(/img/whatsapp_background.png)]'>
      <div className='flex h-full flex-col'>
        <ChatTopbar inChat={data?.inChat ?? false} telefono={telefono} />
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
