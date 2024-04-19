'use client';
import { useChatSidebar } from '@/components/chat/layout/ChatSidebarMobile';
import ContactoCard from '@/components/chat/layout/ContactoCard';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import React from 'react';

interface ChatSidebarProps {}

const ChatSidebar = ({}: ChatSidebarProps) => {
  const { data: contactos, isLoading: contactosLoading } =
    trpc.modelo.getAllWithInChat.useQuery();

  if (contactosLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader />
      </div>
    );
  }

  return (
    contactos && (
      <>
        {contactos
          .sort((a, b) =>
            a.inChat && !b.inChat ? -1 : !a.inChat && b.inChat ? 1 : 0
          )
          .map((contacto) => (
            <Link
              href={`/mensajes/chat/${contacto.telefono}`}
              key={contacto.id}
              onClick={() => {
                useChatSidebar.setState({ isOpen: false });
              }}
            >
              <ContactoCard key={contacto.id} contacto={contacto} />
            </Link>
          ))}
      </>
    )
  );
};

export default ChatSidebar;
