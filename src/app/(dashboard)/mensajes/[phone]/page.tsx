'use client';

import ChatTopbar from '@/components/chat/privateChat/ChatTopbar';
import EnviarMensajeUI from '@/components/chat/privateChat/EnviarMensajeUI';
import MensajesList from '@/components/chat/privateChat/MensajesList';
import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';

interface ChatPageProps {}

const ChatPage = ({}: ChatPageProps) => {
  const { phone } = useParams<{ phone: string }>();

  const { mutateAsync: leerMensajes } = trpc.message.readMessages.useMutation();
  const { data } = trpc.message.findMessagesByPhone.useQuery(phone, {
    enabled: !!phone,
    refetchInterval: 5000,
    onSuccess: () => {
      readMessages();
    },
  });
  const utils = trpc.useUtils();
  async function readMessages() {
    await leerMensajes(phone);
    utils.message.nonReadMessages.invalidate();
    utils.profile.getAllWithActiveChat.invalidate();
  }

  useEffect(() => {
    readMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  return (
    <div className='relative w-full bg-[url(/img/whatsapp_background.png)]'>
      <div className='flex h-full flex-col'>
        <ChatTopbar inChat={data?.inChat ?? false} phoneNumber={phone} />
        <div className='h-full overflow-y-auto'>
          {data?.messages != null && (
            <MensajesList phone={phone} messages={data?.messages ?? []} />
          )}
        </div>
        <EnviarMensajeUI phone={phone} inChat={data?.inChat ?? false} />
      </div>
    </div>
  );
};

export default ChatPage;
