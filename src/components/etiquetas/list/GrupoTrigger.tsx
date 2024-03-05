import GrupoEtiquetaModal from '@/components/etiquetas/modal/GrupoEtiquetaModal';
import { RouterOutputs } from '@/server';
import React from 'react';

interface GrupoTriggerProps {
  grupo: Omit<
    RouterOutputs['etiqueta']['getByNombre'][number],
    'created_at' | 'updated_at'
  >;
}

const GrupoTrigger = ({ grupo }: GrupoTriggerProps) => {
  return (
    <div className='flex w-full justify-between hover:no-underline'>
      <p className='pl-3 text-start font-bold'>{grupo.nombre}</p>
      <div className='flex items-center gap-x-2'>
        <div onClick={(e) => e.preventDefault()}>
          <GrupoEtiquetaModal action='EDIT' grupo={grupo} />
        </div>
        <p className='mr-2 text-sm font-semibold'>
          {grupo._count.etiquetas}
          {' etiqueta'}
          {grupo._count.etiquetas > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default GrupoTrigger;
