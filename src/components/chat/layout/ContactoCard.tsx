import ChatFillIcon from '@/components/icons/ChatFillIcon';
import { RouterOutputs } from '@/server';
import Image from 'next/image';
import React from 'react';

interface ContactoCardProps {
  contacto: RouterOutputs['modelo']['getAllWithInChat'][number];
}

const ContactoCard = ({ contacto }: ContactoCardProps) => {
  return (
    <div className='flex items-center justify-between gap-2 p-2 hover:bg-gray-200'>
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
