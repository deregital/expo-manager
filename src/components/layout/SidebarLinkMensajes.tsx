'use client';

import React, { useMemo } from 'react';
import SidebarLink from '@/components/layout/SidebarLink';
import ChatIcon from '@/components/icons/ChatIcon';
import ChatFillIcon from '@/components/icons/ChatFillIcon';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';

interface SidebarLinkMensajesProps {}

const SidebarLinkMensajes = ({}: SidebarLinkMensajesProps) => {
  const { data } = trpc.message.nonReadMessages.useQuery();

  const { nonReadMessages } = useMemo(() => {
    if (!data) return { nonReadMessages: 0 };
    const totalUnreadMessages = data.messages.reduce(
      (total, current) => total + current._count.id,
      0
    );

    return {
      nonReadMessages: totalUnreadMessages,
    };
  }, [data]);

  return (
    <div className='max-h-[400px] overflow-y-auto'>
      <SidebarLink
        to='/mensajes'
        icon={<ChatIcon height={24} width={24} />}
        iconActive={<ChatFillIcon height={24} width={24} />}
        endDecorator={
          nonReadMessages > 0 ? (
            <Badge className='flex aspect-square h-6 w-6 items-center justify-center bg-red-500 text-xs hover:bg-red-500'>
              {nonReadMessages}
            </Badge>
          ) : (
            <></>
          )
        }
      >
        <span>Mensajes</span>
      </SidebarLink>
    </div>
  );
};

export default SidebarLinkMensajes;
