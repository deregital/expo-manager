import EventosCarpetaModal from '@/components/eventos/EventosCarpetaModal';
import FolderIcon from '@/components/icons/FolderIcon';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React from 'react';

interface CarpetaListTriggerProps {
  carpeta: RouterOutputs['evento']['getAll']['carpetas'][number];
}

const CarpetaListTrigger = ({ carpeta }: CarpetaListTriggerProps) => {
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex w-full items-center gap-0.5 hover:no-underline sm:gap-x-2'>
        <FolderIcon fill={getTextColorByBg(carpeta.color)} />
        <p className='whitespace-nowrap text-start'>{carpeta.nombre}</p>
      </div>
      <div className='flex items-center justify-center gap-x-2'>
        <EventosCarpetaModal action='EDIT' eventosCarpeta={carpeta} />
      </div>
    </div>
  );
};

export default CarpetaListTrigger;
