import { useExpandEventos } from '@/components/eventos/expandcontracteventos';
import { Accordion } from '@/components/ui/accordion';
import React, { useEffect } from 'react';
import { RouterOutputs } from '@/server';
import EventoAccordion from '@/components/eventos/EventoAccordion';
import CarpetaEventoAccordion from '@/components/eventos/CarpetaEventoAccordion';

interface EventosListProps {
  eventos: RouterOutputs['evento']['getAll'];
}

const EventosList: React.FC<EventosListProps> = ({ eventos }) => {
  const { state, active, setActive } = useExpandEventos((s) => ({
    state: s.state,
    setActive: s.setActive,
    active: s.active,
  }));

  const { carpetas, sinCarpetas: eventosSinCarpeta } = eventos;

  useEffect(() => {
    if (state === 'EXPAND') {
      setActive(
        carpetas
          .map((carpeta) => carpeta.id)
          .concat(eventosSinCarpeta.map((evento) => evento.id))
      );
    } else if (state === 'NONE') {
      setActive(carpetas.map((carpeta) => carpeta.id));
    } else {
      setActive([]);
    }
  }, [carpetas, eventos, eventosSinCarpeta, setActive, state]);

  if (carpetas.length === 0 && eventosSinCarpeta.length === 0) {
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
      <Accordion
        type='multiple'
        className='pt-4'
        defaultValue={active}
        value={active}
      >
        {carpetas.map((carpeta) => (
          <CarpetaEventoAccordion key={carpeta.id} carpeta={carpeta} />
        ))}
        {eventosSinCarpeta.map((evento) => (
          <EventoAccordion
            isOpen={active.includes(evento.id)}
            key={evento.id}
            evento={evento}
          />
        ))}
      </Accordion>
    </>
  );
};

export default EventosList;
