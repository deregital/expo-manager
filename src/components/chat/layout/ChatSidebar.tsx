'use client';
import { useChatSidebar } from '@/components/chat/layout/ChatSidebarMobile';
import ContactoCard from '@/components/chat/layout/ContactoCard';
import ContactosNoChat from '@/components/chat/layout/ContactosNoChat';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useMemo } from 'react';

interface ChatSidebarProps {}

const ChatSidebar = ({}: ChatSidebarProps) => {
  const { data: contactos, isLoading: contactosLoading } =
    trpc.modelo.getAllWithInChat.useQuery();

  const params = useParams();
  const telefonoSelected = params.telefono as string;

  const contactosNoLeidos = useMemo(() => {
    return contactos
      ? contactos.filter((contacto) => contacto.mensajes.some((m) => !m.visto))
      : [];
  }, [contactos]);

  const contactosLeidos = useMemo(() => {
    if (!contactos) {
      return [];
    }
    return contactosNoLeidos.length > 0
      ? contactos.filter(
          (contacto) => !contactosNoLeidos.some((cnl) => cnl.id === contacto.id)
        )
      : contactos;
  }, [contactos, contactosNoLeidos]);

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
          {contactosNoLeidos.map((contacto) => (
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
                noLeidos={contacto.mensajes.filter((m) => !m.visto).length}
              />
            </Link>
          ))}
        </div>
        <div className='max-h-full overflow-y-auto'>
          <ContactosNoChat
            telefonoSelected={telefonoSelected}
            contactos={contactosLeidos.sort((a, b) =>
              a.nombreCompleto.localeCompare(b.nombreCompleto)
            )}
          />
        </div>
      </aside>
    )
  );
};

export default ChatSidebar;
