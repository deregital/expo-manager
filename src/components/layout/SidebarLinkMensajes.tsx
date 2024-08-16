'use client';

import React, { useMemo } from 'react';
import SidebarLink from '@/components/layout/SidebarLink';
import ChatIcon from '@/components/icons/ChatIcon';
import ChatFillIcon from '@/components/icons/ChatFillIcon';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';

interface SidebarLinkMensajesProps {}

const SidebarLinkMensajes = ({}: SidebarLinkMensajesProps) => {
  const { data } = trpc.whatsapp.mensajesNoLeidos.useQuery();

  console.log(data);

  const { mensajesNoLeidos } = useMemo(() => {
    if (!data) return { mensajesNoLeidos: 0 };
    const totalUnreadMessages = data.reduce(
      (total, current) => total + current._count.id,
      0
    );

    return {
      mensajesNoLeidos: totalUnreadMessages,
    };
  }, [data]);

  return (
    <SidebarLink
      to='/mensajes'
      icon={<ChatIcon height={24} width={24} />}
      iconActive={<ChatFillIcon height={24} width={24} />}
      endDecorator={
        mensajesNoLeidos > 0 ? (
          <Badge className='aspect-square h-fit bg-red-500 text-xs hover:bg-red-500'>
            {mensajesNoLeidos}
          </Badge>
        ) : (
          <></>
        )
      }
    >
      <span>Mensajes</span>
    </SidebarLink>
  );
};

export default SidebarLinkMensajes;
