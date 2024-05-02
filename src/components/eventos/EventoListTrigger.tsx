'use client';
import { RouterOutputs } from '@/server';
import { format } from 'date-fns';
import React from 'react';
import EventoModal from './eventomodal';
import EventIcon from '../icons/EventIcon';
import { useRouter } from 'next/navigation';

interface EventoListTriggerProps {
  evento: RouterOutputs['evento']['getAll'][number];
}

const EventoListTrigger = ({ evento }: EventoListTriggerProps) => {
  const router = useRouter();

  function redirectToEvent() {
    router.push(`/eventos/${evento.id}`);
  }

  return (
    <div className='flex w-full items-center justify-between'>
      <div className='block w-full justify-between gap-0.5 hover:no-underline sm:flex sm:items-stretch sm:gap-x-2'>
        <p className='whitespace-nowrap text-start'>{evento.nombre}</p>

        <div className='flex w-full items-center gap-x-1'>
          <p className='text-xs text-white/70'>
            {format(evento.fecha, 'dd/MM/yyyy HH:mm')}
            {' - '}
            {evento.ubicacion}
          </p>
        </div>
      </div>
      <div className='flex items-center justify-center gap-x-2'>
        <EventIcon
          className='h-5 w-5 hover:text-black'
          onClick={(e) => {
            e.stopPropagation();
            redirectToEvent();
          }}
        />
        <EventoModal action='EDIT' evento={evento} />
      </div>
    </div>
  );
};

export default EventoListTrigger;
