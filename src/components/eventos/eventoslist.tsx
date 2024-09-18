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
import EventIcon from '../icons/EventIcon';
import { useRouter } from 'next/navigation';

interface EventosListProps {
  eventos: RouterOutputs['evento']['getAll'];
}

const EventosList: React.FC<EventosListProps> = ({ eventos }) => {
  const { state, setContract } = useExpandEventos((s) => ({
    state: s.state,
    setContract: s.contract,
  }));

  const [active, setActive] = useState<string[]>([]);
  const router = useRouter();

  function redirectToEvent(subeventoId: string) {
    router.push(`/eventos/${subeventoId}`);
  }

  useEffect(() => {
    if (state === 'EXPAND') {
      setActive(eventos.map((evento) => evento.id));
    } else if (state === 'NONE') {
      setActive(eventos.map((evento) => evento.id));
    } else {
      setActive([]);
    }
  }, [eventos, state]);

  const eventosPorCarpeta = eventos.reduce(
    (acc: { [key: string]: RouterOutputs['evento']['getAll'] }, evento) => {
      const carpetaId = evento.carpetaId || 'otros';
      if (!acc[carpetaId]) {
        acc[carpetaId] = [];
      }
      acc[carpetaId].push(evento);
      return acc;
    },
    {}
  );

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
    <>
      {Object.keys(eventosPorCarpeta).map((carpetaId) => {
        const eventosCarpeta = eventosPorCarpeta[carpetaId];
        const carpeta = eventosCarpeta[0]?.carpeta;

        return (
          <div key={carpetaId}>
            {carpetaId !== 'otros' && carpeta ? (
              <div className='mb-4'>
                {}
                <h2
                  className='mb-2 text-xl font-semibold'
                  style={{ color: carpeta.color }}
                >
                  {carpeta.nombre}
                </h2>
              </div>
            ) : null}
            <Accordion
              type='multiple'
              className='pt-4'
              defaultValue={active}
              value={active}
            >
              {eventosCarpeta.map((evento) => (
                <AccordionItem
                  value={evento.id}
                  key={evento.id}
                  title={evento.nombre}
                  className='my-2 border-0'
                >
                  <AccordionTrigger
                    className={cn(
                      'flex max-w-full justify-between gap-x-2 rounded-xl px-2 py-1.5',
                      evento.subEventos.length > 0
                        ? 'cursor-pointer'
                        : 'cursor-default'
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
                          <span className='font-normal'>
                            {subevento.nombre}
                          </span>
                        </p>
                        <p className='font-semibold'>
                          Fecha del subevento:{' '}
                          <span className='font-normal'>
                            {format(subevento.fecha, 'dd/MM/yyyy hh:mm')}
                          </span>
                        </p>
                        <p className='font-semibold'>
                          Ubicación del subevento:{' '}
                          <span className='font-normal'>
                            {subevento.ubicacion}
                          </span>
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
              ))}
            </Accordion>
          </div>
        );
      })}
    </>
  );
};

export default EventosList;
