import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RouterOutputs } from '@/server';
import React, { useEffect, useState } from 'react';

interface EventosListProps {
  eventos: RouterOutputs['evento']['getAll'];
}

const EventosList: React.FC<EventosListProps> = ({ eventos }) => {
  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    setActive(eventos.map((evento) => evento.id));
  }, [eventos]);

  if (eventos.length === 0) {
    return (
      <div className='flex h-96 flex-col items-center justify-center gap-y-2'>
        <h3 className='text-xl text-slate-500'>No hay eventos</h3>
        <p className='text-sm text-slate-400'>Agrega nuevos eventos para comenzar</p>
      </div>
    );
  }

  return (
    <Accordion type='multiple' className='pt-4' defaultValue={active} value={active}>
      {eventos.map((evento) => (
        <AccordionItem value={evento.id} key={evento.id} title={evento.nombre} className='my-2 border-0'>
          <AccordionTrigger
            className='rounded-xl px-2 py-1.5'
            style={{ backgroundColor: '#4B5563', color: '#FFFFFF' }}
          >
            {evento.nombre}
          </AccordionTrigger>
          <AccordionContent className='pb-0 pl-2'>
            <p>Fecha: {evento.fecha}</p>
            <p>Ubicación: {evento.ubicacion}</p>
            {evento.subEventos.map((subevento) => (
              <div key={subevento.nombre}>
                <p>Nombre del subevento: {subevento.nombre}</p>
                <p>Fecha del subevento: {subevento.fecha}</p>
                <p>Ubicación del subevento: {subevento.ubicacion}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default EventosList;