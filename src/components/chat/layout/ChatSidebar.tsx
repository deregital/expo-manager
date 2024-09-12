'use client';
import { useChatSidebar } from '@/components/chat/layout/ChatSidebarMobile';
import ContactoCard from '@/components/chat/layout/ContactoCard';
import ContactosNoChat from '@/components/chat/layout/ContactosNoChat';
import Loader from '@/components/ui/loader';
import { Filtro, filterModelos } from '@/lib/filter';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useMemo } from 'react';

type ChatSidebarProps = {
  input: string;
  etiquetas: Filtro['etiquetas'];
  grupos: Filtro['grupos'];
};

const ChatSidebar = ({ grupos, etiquetas, input }: ChatSidebarProps) => {
  const { data: contactos, isLoading: contactosLoading } =
    trpc.modelo.getAllWithInChat.useQuery();

  const params = useParams();
  const telefonoSelected = params.telefono as string;

  const contactosFiltrados = useMemo(() => {
    if (!contactos) {
      return [];
    }

    return filterModelos(contactos, {
      input,
      etiquetas,
      grupos,
    });
  }, [contactos, etiquetas, grupos, input]);

  if (contactosLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader />
      </div>
    );
  }

  return (
    contactos && (
      <aside className='grid h-full grid-cols-1 grid-rows-[auto,1fr]'>
        <div>
          {contactosFiltrados
            .filter((contacto) => contacto.inChat)
            .map((contacto) => (
              <Link
                href={`/mensajes/${contacto.telefono}`}
                key={contacto.id}
                onClick={() => {
                  useChatSidebar.setState({ isOpen: false });
                }}
              >
                <ContactoCard
                  inPage={telefonoSelected === contacto.telefono}
                  key={contacto.id}
                  contacto={contacto}
                />
              </Link>
            ))}
        </div>
        <div className='max-h-full overflow-y-auto'>
          <ContactosNoChat
            telefonoSelected={telefonoSelected}
            contactos={contactosFiltrados
              .filter((contacto) => !contacto.inChat)
              .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto))}
          />
        </div>
      </aside>
    )
  );
};

export default ChatSidebar;
