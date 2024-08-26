import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RouterOutputs } from '@/server';
import Link from 'next/link';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useChatSidebar } from '@/components/chat/layout/ChatSidebarMobile';
import FotoModelo from '@/components/ui/FotoModelo';

interface ContactosNoChatProps {
  telefonoSelected: string;
  items: {
    contactos: RouterOutputs['modelo']['getAllWithInChat'];
    title: string;
  }[];
}

const ContactosNoChat = ({ telefonoSelected, items }: ContactosNoChatProps) => {
  const [isOpen, setIsOpen] = useState<string>('');
  return (
    <Accordion value={isOpen} type='single' className='overflow-y-auto'>
      {items.map(
        ({ contactos, title }) =>
          contactos.length > 0 && (
            <AccordionItem
              value={title}
              key={title}
              title={title}
              className='my-2 max-h-full border-0'
            >
              <AccordionTrigger
                className={cn(
                  'mx-2',
                  isOpen === title && 'border-b border-black/10'
                )}
                onClick={() => {
                  if (isOpen === title) {
                    setIsOpen('');
                  } else {
                    setIsOpen(title);
                  }
                }}
              >
                {title}
              </AccordionTrigger>
              <AccordionContent>
                <div className='flex flex-col gap-y-2'>
                  {contactos.map((contacto) => {
                    const inPage = telefonoSelected === contacto.telefono;
                    return (
                      <Link
                        href={`/mensajes/${contacto.telefono}`}
                        onClick={() => {
                          useChatSidebar.setState({ isOpen: false });
                        }}
                        key={contacto.id}
                        className={cn(
                          'flex items-center gap-x-2 p-2 hover:bg-gray-200',
                          {
                            'hover:bg-gray-200': !inPage,
                            'bg-green-200 hover:bg-green-300': inPage,
                          }
                        )}
                      >
                        <FotoModelo
                          url={contacto.fotoUrl}
                          className='h-8 w-8'
                        />
                        <div>
                          <p className='text-sm font-semibold'>
                            {contacto.nombreCompleto}
                          </p>
                          <p className='text-xs text-slate-400'>
                            {contacto.telefono}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
      )}
    </Accordion>
  );
};

export default ContactosNoChat;
