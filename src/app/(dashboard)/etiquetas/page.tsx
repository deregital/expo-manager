'use client';
import { Input } from '@/components/ui/input';
import { useDebounceValue } from 'usehooks-ts';
import React from 'react';
import { trpc } from '@/lib/trpc';

import EtiquetasList from '@/components/etiquetas/EtiquetasList';

const EtiquetasPage = () => {
  const [search, setSearch] = useDebounceValue('', 500);
  const { data: grupos } = trpc.etiqueta.getByNombre.useQuery(search);

  return (
    <div className='p-4'>
      <div className='flex justify-between'>
        {/* div para botones de crear e input */}
        <p>EtiquetasPage</p>
        <Input
          className='max-w-md'
          placeholder='Buscar grupo o etiqueta'
          //   value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <EtiquetasList grupos={grupos ?? []} />
    </div>
  );
};

export default EtiquetasPage;
