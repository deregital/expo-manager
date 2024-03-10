'use client';

import React from 'react';
import { columns } from '@/components/modelos/table/columns';
import { DataTable } from '@/components/modelos/table/dataTable';
import { trpc } from '@/lib/trpc';
import FiltroTabla from '@/components/modelos/FiltroTabla';
import { useSearchParams } from 'next/navigation';

const ModelosPage = () => {
  const searchParams = new URLSearchParams(useSearchParams());
  const { data: modelos } = trpc.modelo.getByFiltro.useQuery(getParams());
  function getParams() {
    return {
      nombre: searchParams.get('nombre') ?? undefined,
      etiquetaId: searchParams.get('etiqueta') ?? undefined,
      grupoId: searchParams.get('grupoId') ?? undefined,
    };
  }
  return (
    <div>
      <p className='px-3 pt-3 text-xl font-bold md:px-5 md:pt-5 md:text-3xl'>
        Gestor de Modelos
      </p>
      <FiltroTabla />
      <DataTable columns={columns} data={modelos ?? []} />
    </div>
  );
};

export default ModelosPage;
