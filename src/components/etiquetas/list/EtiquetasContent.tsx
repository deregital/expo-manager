import { GrupoConMatch } from '@/components/etiquetas/list/EtiquetasList';
import EtiquetaModal from '@/components/etiquetas/modal/EtiquetaModal';
import ModeloIcon from '@/components/icons/ModeloIcon';
import { cn } from '@/lib/utils';
import { TipoEtiqueta } from '@prisma/client';
import Link from 'next/link';
import React from 'react';

interface EtiquetasContentProps {
  etiqueta: GrupoConMatch['etiquetas'][number];
  background: string;
}

const EtiquetasContent = ({ etiqueta, background }: EtiquetasContentProps) => {
  const searchParams = new URLSearchParams();

  function setSearchParams() {
    // etiqueta=${etiqueta.id}&grupoId=${grupoId}
    searchParams.set(
      'etiquetas',
      JSON.stringify([
        {
          etiqueta: { id: etiqueta.id, nombre: etiqueta.nombre },
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
      <p className={cn('capitalize', etiqueta.match && 'underline')}>
        {etiqueta.nombre}
      </p>
      <div className='flex items-center gap-x-2'>
        {etiqueta.tipo === TipoEtiqueta.PERSONAL && (
          <EtiquetaModal action='EDIT' etiqueta={etiqueta} />
        )}
        <p className='text-sm font-semibold'>{etiqueta._count.perfiles}</p>
        <Link href={`/modelos?${setSearchParams()}`}>
          <ModeloIcon className='h-4 w-4 hover:cursor-pointer hover:text-gray-700' />
        </Link>
      </div>
    </div>
  );
};

export default EtiquetasContent;
