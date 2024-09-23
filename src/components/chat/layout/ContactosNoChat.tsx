import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RouterOutputs } from '@/server';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import ContactosList from '@/components/chat/layout/ContactosList';

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
    <Accordion value={isOpen} type='single'>
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
                <ContactosList
                  telefonoSelected={telefonoSelected}
                  contactos={contactos}
                />
              </AccordionContent>
            </AccordionItem>
          )
      )}
    </Accordion>
  );
};

export default ContactosNoChat;
