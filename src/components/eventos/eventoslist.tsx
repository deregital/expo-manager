import { useExpandEventos } from '@/components/eventos/expandcontracteventos';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RouterOutputs } from '@/server';
import React, { useEffect, useState } from 'react';

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
          style={{ backgroundColor: '#ffcccc' }} // Color de fondo para eventos
        >
          <AccordionTrigger
            className='rounded-xl px-2 py-1.5'
            style={{ backgroundColor: '#4B5563', color: '#FFFFFF' }}
            onClick={() => {
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
            {evento.nombre}
          </AccordionTrigger>
          <AccordionContent className='pb-0 pl-2'>
            <p>Fecha: {evento.fecha}</p>
            <p>Ubicación: {evento.ubicacion}</p>
            {evento.subEventos.map((subevento) => (
              <div
                key={subevento.nombre}
                className='subevento-container' // Clase para aplicar estilo a los subeventos
              >
                <p>Nombre del subevento: {subevento.nombre}</p>
                <p>Fecha del subevento: {subevento.fecha}</p>
                <p>Ubicación del subevento: {subevento.ubicacion}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
      <style jsx>{`
        .subevento-container {
          background-color: #ccffcc; /* Color de fondo para subeventos */
          padding: 10px;
          margin-bottom: 5px;
          margin-left: 20px;
        }
      `}</style>
    </Accordion>
  );
};

export default EventosList;
