import VirtualizedContactsList from '@/components/chat/layout/VirtualizedContactsList';
import { Accordion } from '@/components/ui/accordion';
import { type RouterOutputs } from '@/server';
import React, { useState } from 'react';

interface ContactosNoChatProps {
  telefonoSelected: string;
  items: {
    contactos: RouterOutputs['profile']['getAllWithActiveChat'];
    title: string;
  }[];
}

const ContactosNoChat = ({ telefonoSelected, items }: ContactosNoChatProps) => {
  const [isOpen, setIsOpen] = useState<string>('');
  return (
    <Accordion value={isOpen} type='single'>
      <div>
        {items.map(({ contactos, title }) => (
          <VirtualizedContactsList
            key={title}
            profiles={contactos}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={title}
            phoneNumberSelected={telefonoSelected}
          />
        ))}
      </div>
    </Accordion>
  );
};

export default ContactosNoChat;
