import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import React, { useState } from 'react';
import { toast } from 'sonner';
import ResponsesList from './ResponsesList';

interface SendMessageUIProps {
  phone: string;
  inChat: boolean;
}

const SendMessageUI = ({ phone, inChat }: SendMessageUIProps) => {
  const utils = trpc.useUtils();
  const sendMessage = trpc.message.sendMessageToPhone.useMutation();
  const [message, setMessage] = useState('');

  const handleSelectRespuesta = (descripcion: string) => {
    setMessage(descripcion);
  };

  return (
    <form
      className='z-10 flex flex-row gap-4 bg-[#f0f2f5] px-4 py-2'
      onSubmit={async (event) => {
        if (!inChat) return;
        event.preventDefault();
        await sendMessage
          .mutateAsync({
            phone: phone,
            message,
          })
          .then(async (res) => {
            setMessage('');
            utils.message.findMessagesByPhone.refetch(phone);
          })
          .catch((error) => {
            const errorMessage = JSON.parse(error.message)[0].message;

            toast.error(errorMessage);
          });
      }}
    >
      <ResponsesList isActive={inChat} onSelect={handleSelectRespuesta} />
      <input
        disabled={!inChat || sendMessage.isLoading}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className='w-full rounded-md p-2'
        placeholder={
          inChat
            ? 'Escribí un mensaje'
            : 'No se pueden mandar mensajes ahora, mandale una plantilla antes'
        }
      />
      <Button disabled={!inChat || sendMessage.isLoading} type='submit'>
        Enviar
      </Button>
    </form>
  );
};

export default SendMessageUI;
