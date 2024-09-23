import { useChatSidebar } from '@/components/chat/layout/ChatSidebarMobile';
import FotoModelo from '@/components/ui/FotoModelo';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import Link from 'next/link';
import React, { useRef } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

interface ContactosListProps {
  contactos: RouterOutputs['modelo']['getAllWithInChat'];
  telefonoSelected: string;
}

const ContactosList = ({ contactos, telefonoSelected }: ContactosListProps) => {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    enabled: contactos.length > 0,
    count: contactos.length,
    estimateSize: () => 50,
    overscan: 20,
    getScrollElement: () => parentRef.current,
  });

  return (
    <div
      className='flex flex-col gap-y-2'
      ref={parentRef}
      style={{
        maxHeight: 'calc(100vh - 15rem)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const contacto = contactos[virtualItem.index];
          const inPage = telefonoSelected === contacto.telefono;
          return (
            <Link
              href={`/mensajes/${contacto.telefono}`}
              onClick={() => {
                useChatSidebar.setState({ isOpen: false });
              }}
              key={virtualItem.key}
              className={cn('flex items-center gap-x-2 p-2 hover:bg-gray-200', {
                'hover:bg-gray-200': !inPage,
                'bg-green-200 hover:bg-green-300': inPage,
              })}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <FotoModelo url={contacto.fotoUrl} className='h-8 w-8' />
              <div>
                <p className='text-sm font-semibold'>
                  {contacto.nombreCompleto}
                </p>
                <p className='text-xs text-slate-400'>{contacto.telefono}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ContactosList;
