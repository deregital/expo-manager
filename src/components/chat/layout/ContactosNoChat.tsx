import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RouterOutputs } from '@/server';
import Link from 'next/link';
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useChatSidebar } from '@/components/chat/layout/ChatSidebarMobile';
import FotoModelo from '@/components/ui/FotoModelo';
import { useVirtualizer } from '@tanstack/react-virtual';

interface ContactosNoChatProps {
  telefonoSelected: string;
  items: {
    contactos: RouterOutputs['modelo']['getAllWithInChat'];
    title: string;
  }[];
}

const ContactosNoChat = ({ telefonoSelected, items }: ContactosNoChatProps) => {
  const [isOpen, setIsOpen] = useState<string>('');

  // Ref para el contenedor scrollable
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimación del tamaño en píxeles por cada item
  });

  return (
    <Accordion value={isOpen} type='single' className='overflow-y-auto'>
      {}
      <div ref={parentRef} className='h-96 overflow-auto'>
        {}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Solo los items visibles, posicionados manualmente para estar en vista */}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const { contactos, title } = items[virtualRow.index];
            return (
              contactos.length > 0 && (
                <AccordionItem
                  value={title}
                  key={title}
                  title={title}
                  className='my-2 max-h-full border-0'
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',

                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <AccordionTrigger
                    className={cn(
                      'mx-2',
                      isOpen === title && 'border-b border-black/10'
                    )}
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
                  <AccordionContent>
                    <div className='flex flex-col gap-y-2'>
                      {contactos.map((contacto) => {
                        const inPage = telefonoSelected === contacto.telefono;
                        return (
                          <Link
                            href={`/mensajes/${contacto.telefono}`}
                            onClick={() => {
                              useChatSidebar.setState({ isOpen: false });
                            }}
                            key={contacto.id}
                            className={cn(
                              'flex items-center gap-x-2 p-2 hover:bg-gray-200',
                              {
                                'hover:bg-gray-200': !inPage,
                                'bg-green-200 hover:bg-green-300': inPage,
                              }
                            )}
                          >
                            <FotoModelo
                              url={contacto.fotoUrl}
                              className='h-8 w-8'
                            />
                            <div>
                              <p className='text-sm font-semibold'>
                                {contacto.nombreCompleto}
                              </p>
                              <p className='text-xs text-slate-400'>
                                {contacto.telefono}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            );
          })}
        </div>
      </div>
    </Accordion>
  );
};

export default ContactosNoChat;
