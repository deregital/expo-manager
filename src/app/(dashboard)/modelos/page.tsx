'use client';

import { columns } from '@/components/modelos/table/columns';
import { DataTable } from '@/components/modelos/table/dataTable';
import { trpc } from '@/lib/trpc';
import React from 'react';

const ModelosPage = () => {
  const { data } = trpc.modelo.getByFiltro.useQuery({
    // cambiar por el filtro de searchParams
    etiquetaId: undefined,
    grupoId: undefined,
    nombre: '',
  });

  return (
    <div>
      <DataTable columns={columns} data={data ?? []} />
    </div>
  );
};

export default ModelosPage;
