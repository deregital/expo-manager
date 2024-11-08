'use client';
import { useChatSidebar } from '@/components/chat/layout/ChatSidebarMobile';
import ContactoCard from '@/components/chat/layout/ContactoCard';
import ContactosNoChat from '@/components/chat/layout/ContactosNoChat';
import Loader from '@/components/ui/loader';
import { Filtro, filterProfiles } from '@/lib/filter';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useMemo } from 'react';
import CannedResponsesModal from '../CannedResponsesModal';
import { RouterOutputs } from '@/server';

type ChatSidebarProps = {
  filter: Filtro;
};

const ChatSidebar = ({ filter }: ChatSidebarProps) => {
  const { data: profiles, isLoading: profilesLoading } =
    trpc.modelo.getAllWithInChat.useQuery();

  const params = useParams<{ telefono: string }>();
  const phoneNumberSelected = params.telefono;

  const filteredProfiles = useMemo(() => {
    if (!profiles) {
      return [];
    }
    return filterProfiles(profiles, filter);
  }, [profiles, filter]);

  const nonReadProfiles = useMemo(() => {
    return filteredProfiles
      ? filteredProfiles.filter((profile) =>
          profile.mensajes.some((m) => !m.visto)
        )
      : [];
  }, [filteredProfiles]);

  const readProfiles = useMemo(() => {
    if (!filteredProfiles) {
      return [];
    }
    return nonReadProfiles.length > 0
      ? filteredProfiles.filter(
          (profile) => !nonReadProfiles.some((cnl) => cnl.id === profile.id)
        )
      : filteredProfiles;
  }, [filteredProfiles, nonReadProfiles]);

  const getUltimaFechaMensaje = (
    profile: RouterOutputs['modelo']['getAllWithInChat'][number]
  ) => {
    const ultimoMensaje =
      profile.mensajes.length > 0
        ? profile.mensajes[profile.mensajes.length - 1]
        : null;
    return ultimoMensaje
      ? new Date(ultimoMensaje.message.timestamp)
      : new Date(0);
  };

  const activeProfiles = useMemo(() => {
    return readProfiles
      .filter((c) => c.inChat)
      .sort((a, b) => {
        const dateA = getUltimaFechaMensaje(a);
        const dateB = getUltimaFechaMensaje(b);
        return dateB.getTime() - dateA.getTime();
      });
  }, [readProfiles]);

  const contactosInactivos = useMemo(() => {
    return readProfiles
      .filter((c) => !c.inChat)
      .sort((a, b) => {
        const fechaA = getUltimaFechaMensaje(a);
        const fechaB = getUltimaFechaMensaje(b);
        return fechaB.getTime() - fechaA.getTime();
      });
  }, [readProfiles]);

  if (profilesLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader />
      </div>
    );
  }

  return (
    profiles && (
      <aside className='grid h-full grid-cols-1 grid-rows-[auto,1fr] gap-y-2 pb-4'>
        <div className='max-h-80 overflow-y-auto'>
          {nonReadProfiles.map((contacto) => (
            <Link
              href={`/mensajes/${contacto.phoneNumber}`}
              key={contacto.id}
              onClick={() => {
                useChatSidebar.setState({ isOpen: false });
              }}
            >
              <ContactoCard
                inPage={phoneNumberSelected === contacto.phoneNumber}
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
          telefonoSelected={phoneNumberSelected}
          items={[
            {
              title: 'Contactos activos',
              contactos: activeProfiles,
            },
            {
              title: 'Contactos inactivos',
              contactos: contactosInactivos,
            },
          ]}
        />
        <div className='px-4 [&>button]:w-full'>
          <CannedResponsesModal action='CREATE' />
        </div>
      </aside>
    )
  );
};

export default ChatSidebar;
