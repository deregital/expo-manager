import ChatFillIcon from '@/components/icons/ChatFillIcon';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import Image from 'next/image';
import React from 'react';

interface ContactoCardProps {
  contacto: RouterOutputs['modelo']['getAllWithInChat'][number];
  inPage: boolean;
}

const ContactoCard = ({ contacto, inPage }: ContactoCardProps) => {
  return (
    <div
      className={cn('flex items-center justify-between gap-2 p-2', {
        'hover:bg-gray-200': !inPage,
        'bg-green-200 hover:bg-green-300': inPage,
      })}
    >
      <Image
        src={contacto.fotoUrl ?? '/img/profilePlaceholder.jpg'}
        alt={contacto.nombreCompleto}
        width={50}
        height={50}
        className='aspect-square rounded-full'
      />
      <div className='flex w-full items-center justify-end gap-x-2'>
        <p className='truncate'>{contacto.nombreCompleto}</p>
        {contacto.inChat && <ChatFillIcon />}
      </div>
    </div>
  );
};

export default ContactoCard;
