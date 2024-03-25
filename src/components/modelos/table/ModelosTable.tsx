import { columns } from '@/components/modelos/table/columns';
import { DataTable } from '@/components/modelos/table/dataTable';
import { trpc } from '@/lib/trpc';
import { searchNormalize } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

interface ModelosTableProps {}

function filterModelos(
  modelos: RouterOutputs['modelo']['getAll'],
  search: { nombre?: string; etiquetaId?: string; grupoId?: string }
) {
  if (
    search.nombre === undefined &&
    search.etiquetaId === undefined &&
    search.grupoId === undefined
  )
    return modelos;

  const mod = modelos?.filter((modelo) => {
    return (
      (search.nombre === undefined ||
        searchNormalize(modelo.nombreCompleto, search.nombre) ||
        (modelo.idLegible &&
          searchNormalize(modelo.idLegible, search.nombre))) &&
      (search.etiquetaId === undefined ||
        modelo.etiquetas.some(
          (etiqueta) => etiqueta.id === search.etiquetaId
        )) &&
      (search.grupoId === undefined ||
        modelo.etiquetas.some(
          (etiqueta) => etiqueta.grupoId === search.grupoId
        ))
    );
  });
  return mod;
}

const ModelosTable = ({}: ModelosTableProps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchParams = useSearchParams();
  const [search, setSearch] = useState<{
    nombre?: string;
    etiquetaId?: string;
    grupoId?: string;
  }>({
    nombre: searchParams.get('nombre') ?? undefined,
    etiquetaId: searchParams.get('etiqueta') ?? undefined,
    grupoId: searchParams.get('grupoId') ?? undefined,
  });

  const {
    data: modelos,
    isLoading,
    isRefetching,
  } = trpc.modelo.getAll.useQuery();

  useEffect(() => {
    setSearch({
      nombre: searchParams.get('nombre') ?? undefined,
      etiquetaId: searchParams.get('etiqueta') ?? undefined,
      grupoId: searchParams.get('grupoId') ?? undefined,
    });
  }, [searchParams]);

  const data = useMemo(() => {
    return filterModelos(modelos ?? [], search);
  }, [search, modelos]);

  return (
    <DataTable
      isLoading={isLoading && !isRefetching}
      columns={columns}
      data={data}
    />
  );
};

export default ModelosTable;
