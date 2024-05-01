import { GrupoConMatch } from '@/components/etiquetas/list/EtiquetasList';
import GrupoEtiquetaModal from '@/components/etiquetas/modal/GrupoEtiquetaModal';
import { cn } from '@/lib/utils';
import { LockIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';

interface GrupoTriggerProps {
  grupo: GrupoConMatch;
}

const GrupoTrigger = ({ grupo }: GrupoTriggerProps) => {
  const searchParams = new URLSearchParams(useSearchParams());
  const router = useRouter();
  const esEvento = useMemo(() => {
    return grupo.etiquetas.some((etiqueta) => etiqueta.tipo === 'EVENTO');
  }, [grupo.etiquetas]);

  function redirectTable(e: React.MouseEvent<HTMLSpanElement>) {
    e.preventDefault();
    e.stopPropagation();
    searchParams.set('grupoId', grupo.id);
    router.push(`/modelos?${searchParams.toString()}`);
  }
  return (
    <div className='flex w-full justify-between hover:no-underline'>
      <div className='pl-3 text-start'>
        <p className={cn('font-bold leading-none', grupo.match && 'underline')}>
          {grupo.nombre}
        </p>
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
        {grupo.esExclusivo ? <LockIcon className='h-5 w-5' /> : null}
        {!esEvento && (
          <div onClick={(e) => e.preventDefault()}>
            <GrupoEtiquetaModal action='EDIT' grupo={grupo} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GrupoTrigger;
