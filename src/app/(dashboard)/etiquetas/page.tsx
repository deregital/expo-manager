'use client';
import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';

import EtiquetasList from '@/components/etiquetas/list/EtiquetasList';
import SearchInput from '@/components/ui/SearchInput';
import GrupoEtiquetaModal from '@/components/etiquetas/modal/GrupoEtiquetaModal';
import EtiquetaModal from '@/components/etiquetas/modal/EtiquetaModal';
import Loader from '@/components/ui/loader';
import { normalize } from '@/lib/utils';

const EtiquetasPage = () => {
  const [search, setSearch] = useState('');
  const { data: grupos, isLoading } = trpc.etiqueta.getByNombre.useQuery();

  const gruposFiltrados = useMemo(() => {
    if (search === '') return grupos;

    return grupos?.filter((grupo) => {
      return (
        grupo.etiquetas.some((etiqueta) =>
          normalize(etiqueta.nombre)
            .toLowerCase()
            .includes(search.toLowerCase())
        ) ||
        normalize(grupo.nombre).toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [grupos, search]);

  return (
    <>
      <p className='p-3 text-xl font-bold md:p-5 md:text-3xl'>
        Gestor de Etiquetas
      </p>
      <div className='flex flex-col justify-between gap-4 px-3 md:flex-row md:px-5'>
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
        {isLoading ? (
          <div className='mt-5 flex justify-center'>
            <Loader />
          </div>
        ) : (
          <EtiquetasList grupos={gruposFiltrados ?? []} />
        )}
      </div>
    </>
  );
};

export default EtiquetasPage;
