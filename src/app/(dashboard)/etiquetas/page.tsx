'use client';
import { useDebounceValue } from 'usehooks-ts';
import React from 'react';
import { trpc } from '@/lib/trpc';

import EtiquetasList from '@/components/etiquetas/list/EtiquetasList';
import SearchInput from '@/components/etiquetas/list/SearchInput';
import GrupoEtiquetaModal from '@/components/etiquetas/modal/GrupoEtiquetaModal';

const EtiquetasPage = () => {
  const [search, setSearch] = useDebounceValue('', 500);
  const { data: grupos } = trpc.etiqueta.getByNombre.useQuery(search);

  return (
    <div className='p-4'>
      <div className='flex justify-between'>
        {/* div para botones de crear e input */}
        <GrupoEtiquetaModal action='CREATE' />

        <SearchInput onChange={setSearch} />
      </div>
      <EtiquetasList grupos={grupos ?? []} />
    </div>
  );
};

export default EtiquetasPage;
