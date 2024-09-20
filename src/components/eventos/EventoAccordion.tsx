import EventoListTrigger from '@/components/eventos/EventoListTrigger';
import { useExpandEventos } from '@/components/eventos/expandcontracteventos';
import EventIcon from '@/components/icons/EventIcon';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn, getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React from 'react';

interface EventoAccordionProps {
  evento: RouterOutputs['evento']['getAll']['sinCarpetas'][number];
  color?: string;
  onClick?: () => void;
  isOpen: boolean;
}

const EventoAccordion = ({
  evento,
  color,
  onClick,
  isOpen,
}: EventoAccordionProps) => {
  const router = useRouter();
  const { clickTrigger } = useExpandEventos((s) => ({
    clickTrigger: s.clickTrigger,
  }));

  function redirectToEvent(subeventoId: string) {
    router.push(`/eventos/${subeventoId}`);
  }

  return (
    <AccordionItem
      value={evento.id}
      key={evento.id}
      title={evento.nombre}
      className='my-2 border-0'
    >
      <AccordionTrigger
        className={cn(
          'flex max-w-full justify-between gap-x-2 rounded-xl px-2 py-1.5',
          evento.subEventos.length > 0 ? 'cursor-pointer' : 'cursor-default',
          isOpen && 'rounded-br-none'
        )}
        showArrow={evento.subEventos.length > 0}
        style={{
          backgroundColor: color ? `${color}80` : '#4B5563',
          color: color ? getTextColorByBg(color) : '#FFFFFF',
        }}
        onClick={() => {
          if (evento.subEventos.length === 0) return;
          onClick ? onClick() : clickTrigger(evento.id);
        }}
      >
        <EventoListTrigger evento={evento} />
      </AccordionTrigger>
      <AccordionContent className='pb-0 pl-2'>
        {evento.subEventos.map((subevento) => (
          <div
            key={subevento.nombre}
            className='mb-1.5 ml-5 rounded-b-md p-2.5'
            style={{
              backgroundColor: color ? `${color}4b` : `#4B55634b`,
            }}
          >
            <p className='font-semibold'>
              Nombre del subevento:{' '}
              <span className='font-normal'>{subevento.nombre}</span>
            </p>
            <p className='font-semibold'>
              Fecha del subevento:{' '}
              <span className='font-normal'>
                {format(subevento.fecha, 'dd/MM/yyyy hh:mm')}
              </span>
            </p>
            <p className='font-semibold'>
              Ubicación del subevento:{' '}
              <span className='font-normal'>{subevento.ubicacion}</span>
            </p>
            <p className='flex gap-x-1 font-semibold'>
              Confirmación de asistencia al subevento:
              <EventIcon
                className='h-5 w-5 hover:cursor-pointer hover:text-black/60'
                onClick={(e) => {
                  e.stopPropagation();
                  redirectToEvent(subevento.id);
                }}
              />
            </p>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

export default EventoAccordion;
