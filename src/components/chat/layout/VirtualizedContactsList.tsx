import FotoModelo from '@/components/ui/FotoModelo';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { useChatSidebar } from '@/components/chat/layout/ChatSidebarMobile';
import Link from 'next/link';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedContactsListProps {
  isOpen: string;
  setIsOpen: Dispatch<SetStateAction<string>>;
  telefonoSelected: string;
  contactos: RouterOutputs['modelo']['getAllWithInChat'];
  title: string;
}

const VirtualizedContactsList = ({
  contactos,
  isOpen,
  setIsOpen,
  title,
  telefonoSelected,
}: VirtualizedContactsListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: contactos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52, // Estimación del tamaño en píxeles por cada item
  });

  return (
    <AccordionItem
      value={title}
      key={title}
      title={title}
      className='my-2 max-h-96 overflow-y-auto border-0'
    >
      <AccordionTrigger
        className={cn('mx-2', isOpen === title && 'border-b border-black/10')}
        onClick={() => {
          if (isOpen === title) {
            setIsOpen('');
          } else {
            setIsOpen(title);
          }
        }}
      >
        {title}
      </AccordionTrigger>
      <AccordionContent
        ref={parentRef}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        <div className='space-y-2'>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const contacto = contactos[virtualItem.index];
            const inPage = telefonoSelected === contacto.telefono;
            return (
              <Link
                prefetch={false}
                href={`/mensajes/${contacto.telefono}`}
                ref={rowVirtualizer.measureElement}
                data-index={virtualItem.index}
                onClick={() => {
                  useChatSidebar.setState({ isOpen: false });
                }}
                key={virtualItem.key}
                className={cn(
                  'flex items-center gap-x-2 p-2 hover:bg-gray-200',
                  {
                    'hover:bg-gray-200': !inPage,
                    'bg-green-200 hover:bg-green-300': inPage,
                  }
                )}
                style={{
                  position: 'absolute',
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                  height: `${virtualItem.size}px`,
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
      </AccordionContent>
    </AccordionItem>
  );
};

export default VirtualizedContactsList;
