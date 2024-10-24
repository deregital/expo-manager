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
import RespuestasEnlatadasModal from '../RespuestasEnlatadasModal';

type ChatSidebarProps = {
  filtro: Filtro;
};

const ChatSidebar = ({ filtro }: ChatSidebarProps) => {
  const { data: contactos, isLoading: contactosLoading } =
    trpc.modelo.getAllWithInChat.useQuery();

  const params = useParams();
  const telefonoSelected = params.telefono as string;

  const contactosFiltrados = useMemo(() => {
    if (!contactos) {
      return [];
    }
    return filterModelos(contactos, filtro);
  }, [contactos, filtro]);

  const contactosNoLeidos = useMemo(() => {
    return contactosFiltrados
      ? contactosFiltrados.filter((contacto) =>
          contacto.mensajes.some((m) => !m.visto)
        )
      : [];
  }, [contactosFiltrados]);

  const contactosLeidos = useMemo(() => {
    if (!contactosFiltrados) {
      return [];
    }
    return contactosNoLeidos.length > 0
      ? contactosFiltrados.filter(
          (contacto) => !contactosNoLeidos.some((cnl) => cnl.id === contacto.id)
        )
      : contactosFiltrados;
  }, [contactosFiltrados, contactosNoLeidos]);

  const getUltimaFechaMensaje = (contacto: any) => {
    const ultimoMensaje =
      contacto.mensajes.length > 0
        ? contacto.mensajes[contacto.mensajes.length - 1]
        : null;
    return ultimoMensaje
      ? new Date(ultimoMensaje.message.timestamp)
      : new Date(0);
  };

  const contactosActivos = useMemo(() => {
    return contactosLeidos
      .filter((c) => c.inChat)
      .sort((a, b) => {
        const fechaA = getUltimaFechaMensaje(a);
        const fechaB = getUltimaFechaMensaje(b);
        return fechaB.getTime() - fechaA.getTime();
      });
  }, [contactosLeidos]);

  const contactosInactivos = useMemo(() => {
    return contactosLeidos
      .filter((c) => !c.inChat)
      .sort((a, b) => {
        const fechaA = getUltimaFechaMensaje(a);
        const fechaB = getUltimaFechaMensaje(b);
        return fechaB.getTime() - fechaA.getTime();
      });
  }, [contactosLeidos]);

  if (contactosLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader />
      </div>
    );
  }

  return (
    contactos && (
      <aside className='grid h-full grid-cols-1 grid-rows-[auto,1fr] gap-y-2 pb-4'>
        <div className='max-h-80 overflow-y-auto'>
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
                noLeidos={
                  (contacto.mensajes as { visto: boolean }[]).filter(
                    (m) => !m.visto
                  ).length
                }
              />
            </Link>
          ))}
        </div>
        <ContactosNoChat
          telefonoSelected={telefonoSelected}
          items={[
            {
              title: 'Contactos activos',
              contactos: contactosActivos,
            },
            {
              title: 'Contactos inactivos',
              contactos: contactosInactivos,
            },
          ]}
        />
        <div className='px-4 [&>button]:w-full'>
          <RespuestasEnlatadasModal action='CREATE' />
        </div>
      </aside>
    )
  );
};

export default ChatSidebar;
