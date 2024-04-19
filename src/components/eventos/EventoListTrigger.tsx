import { RouterOutputs } from '@/server';
import { format } from 'date-fns';
import React from 'react';
import EventoModal from './eventomodal';

interface EventoListTriggerProps {
  evento: RouterOutputs['evento']['getAll'][number];
}

const EventoListTrigger = ({ evento }: EventoListTriggerProps) => {
  return (
    <div className='block w-full justify-between gap-0.5 hover:no-underline sm:flex sm:gap-x-2'>
      <EventoModal action='EDIT' evento={evento} />
      <p className='whitespace-nowrap text-start'>{evento.nombre}</p>

      <div className='flex w-full items-center gap-x-1'>
        <p className='text-xs text-white/70'>
          {format(evento.fecha, 'dd/MM/yyyy HH:mm')}
          {' - '}
          {evento.ubicacion}
        </p>
      </div>
    </div>
  );
};

export default EventoListTrigger;