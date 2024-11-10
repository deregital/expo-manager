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
    trpc.profile.getAllWithActiveChat.useQuery();

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
          profile.messages.some((m) => m.state !== 'SEEN')
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

  const getDateOfLastMessage = (
    profile: RouterOutputs['profile']['getAllWithActiveChat'][number]
  ) => {
    const lastMessage =
      profile.messages.length > 0
        ? profile.messages[profile.messages.length - 1]
        : null;
    return lastMessage ? new Date(lastMessage.message.timestamp) : new Date(0);
  };

  const activeProfiles = useMemo(() => {
    return readProfiles
      .filter((c) => c.inChat)
      .sort((a, b) => {
        const dateA = getDateOfLastMessage(a);
        const dateB = getDateOfLastMessage(b);
        return dateB.getTime() - dateA.getTime();
      });
  }, [readProfiles]);

  const inactiveProfiles = useMemo(() => {
    return readProfiles
      .filter((c) => !c.inChat)
      .sort((a, b) => {
        const fechaA = getDateOfLastMessage(a);
        const fechaB = getDateOfLastMessage(b);
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
                profile={contacto}
                nonRead={
                  contacto.messages.filter((m) => m.state !== 'SEEN').length
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
              contactos: inactiveProfiles,
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
