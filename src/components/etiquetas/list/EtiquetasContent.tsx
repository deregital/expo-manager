import { GrupoConMatch } from '@/components/etiquetas/list/EtiquetasList';
import EtiquetaModal from '@/components/etiquetas/modal/EtiquetaModal';
import ModeloIcon from '@/components/icons/ModeloIcon';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

interface EtiquetasContentProps {
  tag: GrupoConMatch['tags'][number];
  background: string;
}

const EtiquetasContent = ({ tag, background }: EtiquetasContentProps) => {
  const searchParams = new URLSearchParams();

  function setSearchParams() {
    searchParams.set(
      'etiquetas',
      JSON.stringify([
        {
          etiqueta: { id: tag.id, nombre: tag.name },
          include: true,
        },
      ])
    );
    return searchParams.toString();
  }

  return (
    <div
      className='mb-2 ml-1.5 mt-1.5 flex justify-between rounded-md px-4 py-2 text-black shadow-md shadow-black/30'
      style={{
        backgroundColor: `${background}50`,
      }}
    >
      <p className={cn('capitalize', tag.match && 'underline')}>{tag.name}</p>
      <div className='flex items-center gap-x-2'>
        {tag.type === 'PROFILE' && <EtiquetaModal action='EDIT' tag={tag} />}
        <p className='text-sm font-semibold'>{tag._count.profiles}</p>
        <Link href={`/modelos?${setSearchParams()}`}>
          <ModeloIcon className='h-4 w-4 hover:cursor-pointer hover:text-gray-700' />
        </Link>
      </div>
    </div>
  );
};

export default EtiquetasContent;
