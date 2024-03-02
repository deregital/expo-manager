import ModeloIcon from '@/components/icons/ModeloIcon';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React from 'react';

interface EtiquetasContentProps {
  etiqueta: Omit<
    RouterOutputs['etiqueta']['getByNombre'][number]['etiquetas'][number],
    'created_at' | 'updated_at'
  >;
  background: string;
}

const EtiquetasContent = ({ etiqueta, background }: EtiquetasContentProps) => {
  return (
    <div
      className='my-1.5 flex justify-between rounded-md p-2'
      style={{
        backgroundColor: `${background}32`,
        color: getTextColorByBg(background),
      }}
    >
      <p className='capitalize'>{etiqueta.nombre}</p>
      <div className='flex items-center gap-x-2'>
        <ModeloIcon className='h-4 w-4' />
        <p className='text-sm font-semibold'>{etiqueta._count.perfiles}</p>
      </div>
    </div>
  );
};

export default EtiquetasContent;
