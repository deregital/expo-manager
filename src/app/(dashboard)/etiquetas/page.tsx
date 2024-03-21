'use client';
import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';

import EtiquetasList from '@/components/etiquetas/list/EtiquetasList';
import SearchInput from '@/components/ui/SearchInput';
import GrupoEtiquetaModal from '@/components/etiquetas/modal/GrupoEtiquetaModal';
import EtiquetaModal from '@/components/etiquetas/modal/EtiquetaModal';
import Loader from '@/components/ui/loader';
import { normalize } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { create } from 'zustand';
import ExpandContractEtiquetas from '@/components/etiquetas/list/ExpandContractEtiquetas';

export type GrupoConMatch = Omit<
  RouterOutputs['etiqueta']['getByNombre'][number],
  'etiquetas'
> & {
  match: boolean;
  etiquetas: (RouterOutputs['etiqueta']['getByNombre'][number]['etiquetas'][number] & {
    match: boolean;
  })[];
};

export const useExpandEtiquetas = create<{
  state: 'EXPAND' | 'CONTRACT' | 'NONE';
  expand: () => void;
  contract: () => void;
  none: () => void;
}>((set) => ({
  state: 'NONE',
  expand: () => set({ state: 'EXPAND' }),
  contract: () => set({ state: 'CONTRACT' }),
  none: () => set({ state: 'NONE' }),
}));

const EtiquetasPage = () => {
  const [search, setSearch] = useState('');
  const { data: grupos, isLoading } = trpc.etiqueta.getByNombre.useQuery();
  const { expandState, setNone } = useExpandEtiquetas((s) => ({
    setNone: s.none,
    expandState: s.state,
  }));

  const gruposFiltrados = useMemo(() => {
    if (!grupos) return [];

    let g: RouterOutputs['etiqueta']['getByNombre'];

    if (search === '') {
      g = grupos;
    } else {
      g = grupos?.filter((grupo) => {
        return (
          grupo.etiquetas.some((etiqueta) =>
            normalize(etiqueta.nombre)
              .toLowerCase()
              .includes(search.toLowerCase())
          ) ||
          normalize(grupo.nombre).toLowerCase().includes(search.toLowerCase())
        );
      });

      if (!g) return [];
    }

    return g.map((grupo) => {
      return {
        ...grupo,
        match:
          search.length > 0 &&
          normalize(grupo.nombre).toLowerCase().includes(search.toLowerCase()),
        etiquetas: grupo.etiquetas.map((etiqueta) => ({
          ...etiqueta,
          match:
            search.length > 0 &&
            normalize(etiqueta.nombre)
              .toLowerCase()
              .includes(search.toLowerCase()),
        })),
      };
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
        <div className='flex items-center gap-x-2'>
          <ExpandContractEtiquetas />
          <SearchInput
            onChange={(value) => {
              setSearch(value);

              if (value === '') {
                setNone();
              } else if (expandState === 'EXPAND') {
                setNone();
              }
            }}
            placeholder='Buscar grupo o etiqueta'
          />
        </div>
      </div>
      <div className='px-3 md:px-5'>
        {isLoading ? (
          <div className='mt-5 flex justify-center'>
            <Loader />
          </div>
        ) : (
          <EtiquetasList grupos={gruposFiltrados ?? ([] as GrupoConMatch[])} />
        )}
      </div>
    </>
  );
};

export default EtiquetasPage;
