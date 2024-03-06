import EtiquetaModal from '@/components/etiquetas/modal/EtiquetaModal';
import ModeloIcon from '@/components/icons/ModeloIcon';
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
      className='mb-2 ml-1.5 mt-1.5 flex justify-between rounded-md px-4 py-2 text-black shadow-md shadow-black/30'
      style={{
        backgroundColor: `${background}50`,
        // color: getTextColorByBg(background),
      }}
    >
      <p className='capitalize'>{etiqueta.nombre}</p>
      <div className='flex items-center gap-x-2'>
        <EtiquetaModal action='EDIT' etiqueta={etiqueta} />
        <ModeloIcon className='h-4 w-4' />
        <p className='text-sm font-semibold'>{etiqueta._count.perfiles}</p>
      </div>
    </div>
  );
};

export default EtiquetasContent;
