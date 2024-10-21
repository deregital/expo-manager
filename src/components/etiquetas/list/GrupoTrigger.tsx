import { GrupoConMatch } from '@/components/etiquetas/list/EtiquetasList';
import GrupoEtiquetaModal from '@/components/etiquetas/modal/GrupoEtiquetaModal';
import { cn } from '@/lib/utils';
import { LockIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';

interface GrupoTriggerProps {
  group: GrupoConMatch;
}

const GrupoTrigger = ({ group }: GrupoTriggerProps) => {
  const searchParams = new URLSearchParams(useSearchParams());
  const router = useRouter();
  const esEvento = useMemo(() => {
    return group.tags.some((tag) => tag.type === 'EVENT');
  }, [group.tags]);

  const esAdmin = useMemo(() => {
    return group.tags.some((tag) => tag.type === 'PARTICIPANT');
  }, [group.tags]);

  function redirectTable(e: React.MouseEvent<HTMLSpanElement>) {
    e.preventDefault();
    e.stopPropagation();
    searchParams.set('grupoId', group.id);
    router.push(`/modelos?${searchParams.toString()}`);
  }
  return (
    <div className='flex w-full justify-between hover:no-underline'>
      <div className='pl-3 text-start'>
        <p className={cn('font-bold leading-none', group.match && 'underline')}>
          {group.name}
        </p>
        <span
          className='text-[0.70rem] font-semibold leading-none opacity-70 hover:underline'
          onClick={(event) => redirectTable(event)}
        >
          {group._count.tags}
          {' etiqueta'}
          {group._count.tags > 1 ? 's' : ''}
        </span>
      </div>
      <div className='flex items-center gap-x-2'>
        {group.isExclusive ? <LockIcon className='h-5 w-5' /> : null}
        {!esEvento && !esAdmin && (
          <div onClick={(e) => e.preventDefault()}>
            <GrupoEtiquetaModal action='EDIT' group={group} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GrupoTrigger;
