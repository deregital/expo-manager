import { useFiltro } from '@/components/ui/filtro/Filtro';
import FiltroAvanzadoEtiquetasYGrupos from '@/components/ui/filtro/FiltroAvanzadoEtiquetasYGrupos';
import FiltroAvanzadoInputs from '@/components/ui/filtro/FiltroAvanzadoInputs';
import React from 'react';

interface FiltroAvanzadoProps {
  showTag?: boolean;
  mostrarInput?: boolean;
}

const FiltroAvanzado = ({
  showTag = false,
  mostrarInput = false,
}: FiltroAvanzadoProps) => {
  const { filterTags, filterGroups } = useFiltro((s) => ({
    filterTags: s.tags,
    filterGroups: s.groups,
  }));
  return (
    <div className='grid w-full grid-cols-[auto,1fr] grid-rows-1 gap-x-4 border-t border-t-black/10 py-3'>
      <div className='flex h-fit w-full'>
        {showTag && (filterTags.length > 0 || filterGroups.length > 0) && (
          <FiltroAvanzadoEtiquetasYGrupos />
        )}
      </div>
      <div className='flex h-fit w-full'>
        {mostrarInput && <FiltroAvanzadoInputs />}
      </div>
    </div>
  );
};

export default FiltroAvanzado;
