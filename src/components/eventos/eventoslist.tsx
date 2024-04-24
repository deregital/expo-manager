import EventoListTrigger from '@/components/eventos/EventoListTrigger';
import { useExpandEventos } from '@/components/eventos/expandcontracteventos';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { RouterOutputs } from '@/server';

interface EventosListProps {
  eventos: RouterOutputs['evento']['getAll'];
}

const EventosList: React.FC<EventosListProps> = ({ eventos }) => {
  const { state, setContract } = useExpandEventos((s) => ({
    state: s.state,
    setContract: s.contract,
  }));

  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    if (state === 'EXPAND') {
      setActive(eventos.map((evento) => evento.id));
    } else if (state === 'NONE') {
      setActive(eventos.map((evento) => evento.id));
    } else {
      setActive([]);
    }
  }, [eventos, state]);

  if (eventos.length === 0) {
    return (
      <div className='flex h-96 flex-col items-center justify-center gap-y-2'>
        <h3 className='text-xl text-slate-500'>No hay eventos</h3>
        <p className='text-sm text-slate-400'>
          Agrega nuevos eventos para comenzar
        </p>
      </div>
    );
  }

  return (
    <Accordion
      type='multiple'
      className='pt-4'
      defaultValue={active}
      value={active}
    >
      {eventos.map((evento) => (
        <AccordionItem
          value={evento.id}
          key={evento.id}
          title={evento.nombre}
          className='my-2 border-0'
        >
          <AccordionTrigger
            className={cn(
              'flex max-w-full justify-between gap-x-2 rounded-xl px-2 py-1.5',
              evento.subEventos.length > 0 ? 'cursor-pointer' : 'cursor-default'
            )}
            showArrow={evento.subEventos.length > 0}
            style={{ backgroundColor: '#4B5563', color: '#FFFFFF' }}
            onClick={() => {
              if (evento.subEventos.length === 0) return;
              if (active.includes(evento.id)) {
                setActive(active.filter((id) => id !== evento.id));
                if (active.length === 1) {
                  setContract();
                }
              } else {
                setActive([...active, evento.id]);
              }
            }}
          >
            <EventoListTrigger evento={evento} />
          </AccordionTrigger>
          <AccordionContent className='pb-0 pl-2'>
            {evento.subEventos.map((subevento) => (
              <div
                key={subevento.nombre}
                className='mb-1.5 ml-5 rounded-md bg-[#ccffcc] p-2.5'
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
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default EventosList;
