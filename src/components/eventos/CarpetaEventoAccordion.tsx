import CarpetaListTrigger from '@/components/eventos/CarpetaListTrigger';
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

interface CarpetaEventoAccordionProps {
  carpeta: RouterOutputs['evento']['getAll']['carpetas'][number];
}

const CarpetaEventoAccordion = ({ carpeta }: CarpetaEventoAccordionProps) => {
  const [active, setActive] = useState<string[]>([]);
  const { clickTrigger } = useExpandEventos((s) => ({
    clickTrigger: s.clickTrigger,
  }));

  return (
    <AccordionItem
      value={carpeta.id}
      key={carpeta.id}
      title={carpeta.nombre}
      className='my-2 border-0'
    >
      <AccordionTrigger
        className={cn(
          'flex max-w-full justify-between gap-x-2 rounded-xl px-2 py-1.5',
          carpeta.eventos.length > 0 ? 'cursor-pointer' : 'cursor-default'
        )}
        showArrow={carpeta.eventos.length > 0}
        style={{
          backgroundColor: carpeta.color,
          color: getTextColorByBg(carpeta.color),
        }}
        onClick={() => {
          if (carpeta.eventos.length === 0) return;
          clickTrigger(carpeta.id);
        }}
      >
        <CarpetaListTrigger carpeta={carpeta} />
      </AccordionTrigger>
      <AccordionContent className='pb-0 pl-2'>
        <Accordion type='multiple' defaultValue={active} value={active}>
          {carpeta.eventos.map((evento) => (
            <EventoAccordion
              onClick={() => {
                if (active.includes(evento.id)) {
                  setActive(active.filter((id) => id !== evento.id));
                } else {
                  setActive([...active, evento.id]);
                }
              }}
              color={carpeta.color}
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

export default CarpetaEventoAccordion;
