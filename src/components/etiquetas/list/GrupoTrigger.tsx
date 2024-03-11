import GrupoEtiquetaModal from '@/components/etiquetas/modal/GrupoEtiquetaModal';
import { RouterOutputs } from '@/server';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

interface GrupoTriggerProps {
  grupo: Omit<
    RouterOutputs['etiqueta']['getByNombre'][number],
    'created_at' | 'updated_at'
  >;
}

const GrupoTrigger = ({ grupo }: GrupoTriggerProps) => {
  const searchParams = new URLSearchParams(useSearchParams());
  const router = useRouter();
  function redirectTable(e: React.MouseEvent<HTMLSpanElement>) {
    e.preventDefault();
    searchParams.set('grupoId', grupo.id);
    router.push(`/modelos?${searchParams.toString()}`);
  }
  return (
    <div className='flex w-full justify-between hover:no-underline'>
      <div className='pl-3 text-start'>
        <p className='font-bold leading-none'>{grupo.nombre}</p>
        <span
          className='text-[0.70rem] font-semibold leading-none opacity-70 hover:underline'
          onClick={(event) => redirectTable(event)}
        >
          {grupo._count.etiquetas}
          {' etiqueta'}
          {grupo._count.etiquetas > 1 ? 's' : ''}
        </span>
      </div>
      <div className='flex items-center gap-x-2'>
        <div onClick={(e) => e.preventDefault()}>
          <GrupoEtiquetaModal action='EDIT' grupo={grupo} />
        </div>
      </div>
    </div>
  );
};

export default GrupoTrigger;
