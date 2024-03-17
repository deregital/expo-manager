import { columns } from '@/components/modelos/table/columns';
import { DataTable } from '@/components/modelos/table/dataTable';
import { trpc } from '@/lib/trpc';
import { useSearchParams } from 'next/navigation';
import React from 'react';

interface ModelosTableProps {}

const ModelosTable = ({}: ModelosTableProps) => {
  const searchParams = new URLSearchParams(useSearchParams());
  const { data: modelos, isLoading } =
    trpc.modelo.getByFiltro.useQuery(getParams());

  function getParams() {
    return {
      nombre: searchParams.get('nombre') ?? undefined,
      etiquetaId: searchParams.get('etiqueta') ?? undefined,
      grupoId: searchParams.get('grupoId') ?? undefined,
    };
  }

  return (
    <DataTable isLoading={isLoading} columns={columns} data={modelos ?? []} />
  );
};

export default ModelosTable;
