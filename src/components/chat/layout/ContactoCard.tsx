import ChatFillIcon from '@/components/icons/ChatFillIcon';
import FotoModelo from '@/components/ui/FotoModelo';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React from 'react';

interface ContactoCardProps {
  contacto: RouterOutputs['modelo']['getAllWithInChat'][number];
  inPage: boolean;
  noLeidos: number;
}

const ContactoCard = ({ contacto, inPage, noLeidos }: ContactoCardProps) => {
  return (
    <div
      className={cn('flex items-center justify-between gap-2 p-2', {
        'hover:bg-gray-200': !inPage,
        'bg-green-200 hover:bg-green-300': inPage,
      })}
    >
      <div className='relative'>
        <FotoModelo url={contacto.fotoUrl} />
        <Badge className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-red-500 hover:bg-red-500'>
          {noLeidos}
        </Badge>
      </div>
      <div className='flex w-full items-center justify-between gap-x-2 overflow-x-hidden'>
        <p className='truncate'>{contacto.nombreCompleto}</p>
        {contacto.inChat && <ChatFillIcon />}
      </div>
    </div>
  );
};

export default ContactoCard;
