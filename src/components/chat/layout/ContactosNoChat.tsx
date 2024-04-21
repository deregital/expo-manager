import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RouterOutputs } from '@/server';
import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useChatSidebar } from '@/components/chat/layout/ChatSidebarMobile';

interface ContactosNoChatProps {
  contactos: RouterOutputs['modelo']['getAllWithInChat'];
}

const ContactosNoChat = ({ contactos }: ContactosNoChatProps) => {
  const [isOpen, setIsOpen] = useState('');
  return (
    <Accordion value={isOpen} type='single'>
      <AccordionItem
        value='contactos'
        key='contactos'
        title='Contactos'
        className='my-2 border-0'
      >
        <AccordionTrigger
          className={cn(
            'mx-2',
            isOpen === 'contactos' && 'border-b border-black/10'
          )}
          onClick={() => {
            if (isOpen === 'contactos') {
              setIsOpen('');
            } else {
              setIsOpen('contactos');
            }
          }}
        >
          Contactos inactivos
        </AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-y-2'>
            {contactos.map((contacto) => (
              <Link
                href={`/mensajes/${contacto.telefono}`}
                onClick={() => {
                  useChatSidebar.setState({ isOpen: false });
                }}
                key={contacto.id}
                className='flex items-center gap-x-2 p-2 hover:bg-gray-200'
              >
                <Image
                  width={50}
                  height={50}
                  src={contacto.fotoUrl ?? '/img/profilePlaceholder.jpg'}
                  alt={contacto.nombreCompleto}
                  className='h-8 w-8 rounded-full'
                />
                <div>
                  <p className='text-sm font-semibold'>
                    {contacto.nombreCompleto}
                  </p>
                  <p className='text-xs text-slate-400'>{contacto.telefono}</p>
                </div>
              </Link>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ContactosNoChat;
