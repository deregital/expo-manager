import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import React, { useState } from 'react';

interface EnviarMensajeUIProps {
  telefono: string;
  inChat: boolean;
}

const EnviarMensajeUI = ({ telefono, inChat }: EnviarMensajeUIProps) => {
  const utils = trpc.useUtils();
  const sendMessage = trpc.whatsapp.sendMessageToTelefono.useMutation({
    onSuccess: () => {
      setMessage('');
      utils.whatsapp.getMessagesByTelefono.invalidate(telefono);
    },
  });
  const [message, setMessage] = useState('');

  return (
    <form
      className='z-10 flex flex-row gap-4 bg-[#f0f2f5] px-4 py-2'
      onSubmit={(event) => {
        if (!inChat) return;
        event.preventDefault();
        sendMessage.mutateAsync({
          telefono,
          text: message,
        });
      }}
    >
      <input
        disabled={!inChat}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className='w-full rounded-md p-2'
        placeholder={
          inChat
            ? 'Escribí un mensaje'
            : 'No se pueden mandar mensajes ahora, mandale una plantilla antes'
        }
      />
      <Button disabled={!inChat} type='submit'>
        Enviar
      </Button>
    </form>
  );
};

export default EnviarMensajeUI;
