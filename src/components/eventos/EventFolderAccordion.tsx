import EventFolderListTrigger from '@/components/eventos/EventFolderListTrigger';
import EventoAccordion from '@/components/eventos/EventoAccordion';
import { useExpandEventos } from '@/components/eventos/expandcontracteventos';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn, getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React, { useState } from 'react';

interface EventFolderAccordionProps {
  folder: RouterOutputs['evento']['getAll']['carpetas'][number];
}

const EventFolderAccordion = ({ folder }: EventFolderAccordionProps) => {
  const [active, setActive] = useState<string[]>([]);
  const { clickTrigger } = useExpandEventos((s) => ({
    clickTrigger: s.clickTrigger,
  }));

  return (
    <AccordionItem
      value={folder.id}
      key={folder.id}
      title={folder.nombre}
      className='my-2 border-0'
    >
      <AccordionTrigger
        className={cn(
          'flex max-w-full justify-between gap-x-2 rounded-xl px-2 py-1.5',
          folder.eventos.length > 0 ? 'cursor-pointer' : 'cursor-default'
        )}
        showArrow={folder.eventos.length > 0}
        style={{
          backgroundColor: folder.color,
          color: getTextColorByBg(folder.color),
        }}
        onClick={() => {
          if (folder.eventos.length === 0) return;
          clickTrigger(folder.id);
        }}
      >
        <EventFolderListTrigger folder={folder} />
      </AccordionTrigger>
      <AccordionContent className='pb-0 pl-2'>
        <Accordion type='multiple' defaultValue={active} value={active}>
          {folder.eventos.map((evento) => (
            <EventoAccordion
              onClick={() => {
                if (active.includes(evento.id)) {
                  setActive(active.filter((id) => id !== evento.id));
                } else {
                  setActive([...active, evento.id]);
                }
              }}
              color={folder.color}
              isOpen={active.includes(evento.id)}
              key={evento.id}
              evento={evento}
            />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};

export default EventFolderAccordion;
