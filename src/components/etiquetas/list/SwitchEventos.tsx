import EventIcon from '@/components/icons/EventIcon';
import EventOffIcon from '@/components/icons/EventOffIcon';
import React from 'react';

interface SwitchEventosProps {
  showEventos: boolean;
  setShowEventos: (_showEventos: boolean) => void;
}

const SwitchEventos = ({ setShowEventos, showEventos }: SwitchEventosProps) => {
  return showEventos ? (
    <EventIcon
      className='h-7 w-7 cursor-pointer'
      onClick={() => setShowEventos(false)}
    />
  ) : (
    <EventOffIcon
      className='h-7 w-7 cursor-pointer'
      onClick={() => setShowEventos(true)}
    />
  );
};

export default SwitchEventos;
