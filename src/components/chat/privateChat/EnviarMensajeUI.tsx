import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import React, { useState } from 'react';

interface EnviarMensajeUIProps {
  telefono: string;
}

const EnviarMensajeUI = ({ telefono }: EnviarMensajeUIProps) => {
  const sendMessage = trpc.whatsapp.sendMessageToTelefono.useMutation();
  const [message, setMessage] = useState('');

  return (
    <form
      className='flex flex-row gap-4 bg-[#f0f2f5] px-4 py-2'
      onSubmit={(event) => {
        event.preventDefault();
        sendMessage.mutateAsync({
          telefono,
          text: message,
        });
      }}
    >
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className='w-full rounded-md p-2'
        placeholder='Type a message'
      />
      <Button type='submit'>Send</Button>
    </form>
  );
};

export default EnviarMensajeUI;
