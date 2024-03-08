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
      <p>ModelosPage</p>
      <FiltroTabla />
      <DataTable columns={columns} data={data ?? []} />
    </div>
  );
};

export default ModelosPage;
