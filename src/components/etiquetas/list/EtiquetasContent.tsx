import { GrupoConMatch } from '@/app/(dashboard)/etiquetas/page';
import EtiquetaModal from '@/components/etiquetas/modal/EtiquetaModal';
import ModeloIcon from '@/components/icons/ModeloIcon';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

interface EtiquetasContentProps {
  etiqueta: GrupoConMatch['etiquetas'][number];
  background: string;
  grupoId: string;
}

const EtiquetasContent = ({
  etiqueta,
  background,
  grupoId,
}: EtiquetasContentProps) => {
  const searchParams = new URLSearchParams(useSearchParams());
  const router = useRouter();

  function redirectTable(e: React.MouseEvent<SVGElement>) {
    e.preventDefault();
    searchParams.set('etiqueta', etiqueta.id);
    searchParams.set('grupoId', grupoId);
    router.push(`/modelos?${searchParams.toString()}`);
  }

  return (
    <div
      className='mb-2 ml-1.5 mt-1.5 flex justify-between rounded-md px-4 py-2 text-black shadow-md shadow-black/30'
      style={{
        backgroundColor: `${background}50`,
        // color: getTextColorByBg(background),
      }}
    >
      <p className={cn('capitalize', etiqueta.match && 'underline')}>
        {etiqueta.nombre}
      </p>
      <div className='flex items-center gap-x-2'>
        <EtiquetaModal action='EDIT' etiqueta={etiqueta} />
        <p className='text-sm font-semibold'>{etiqueta._count.perfiles}</p>
        <ModeloIcon
          className='h-4 w-4 hover:cursor-pointer hover:text-gray-700'
          onClick={(event) => redirectTable(event)}
        />
      </div>
    </div>
  );
};

export default EtiquetasContent;
