'use client';
import { useDebounceValue } from 'usehooks-ts';
import React from 'react';
import { trpc } from '@/lib/trpc';

import EtiquetasList from '@/components/etiquetas/list/EtiquetasList';
import SearchInput from '@/components/ui/SearchInput';
import GrupoEtiquetaModal from '@/components/etiquetas/modal/GrupoEtiquetaModal';
import EtiquetaModal from '@/components/etiquetas/modal/EtiquetaModal';

const EtiquetasPage = () => {
  const [search, setSearch] = useDebounceValue('', 500);
  const { data: grupos } = trpc.etiqueta.getByNombre.useQuery(search);

  return (
    <>
      <p className='p-3 text-xl font-bold md:p-5 md:text-3xl'>
        Gestor de Etiquetas
      </p>
      <div className='flex flex-col justify-between gap-4 px-3 md:flex-row md:px-5'>
        {/* div para botones de crear e input */}
        <div className='flex flex-col gap-4 md:flex-row'>
          <GrupoEtiquetaModal action='CREATE' />
          <EtiquetaModal action='CREATE' />
        </div>
        <SearchInput
          onChange={setSearch}
          placeholder='Buscar grupo o etiqueta'
        />
      </div>
      <div className='px-3 md:px-5'>
        <EtiquetasList grupos={grupos ?? []} />
      </div>
    </>
  );
};

export default EtiquetasPage;
