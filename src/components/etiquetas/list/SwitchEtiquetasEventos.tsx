import { useEtiquetasSettings } from '@/components/etiquetas/list/ExpandContractEtiquetas';
import EventIcon from '@/components/icons/EventIcon';
import EventOffIcon from '@/components/icons/EventOffIcon';
import React from 'react';

interface SwitchEtiquetasEventosProps {}

const SwitchEtiquetasEventos = ({}: SwitchEtiquetasEventosProps) => {
  const { showEventos } = useEtiquetasSettings();
  return showEventos ? (
    <EventIcon
      className='h-7 w-7 cursor-pointer'
      onClick={() => useEtiquetasSettings.setState({ showEventos: false })}
    />
  ) : (
    <EventOffIcon
      className='h-7 w-7 cursor-pointer'
      onClick={() => useEtiquetasSettings.setState({ showEventos: true })}
    />
  );
};

export default SwitchEtiquetasEventos;
