import { useModelosFiltro } from '@/components/modelos/FiltroTabla';
import { DataTable } from '@/components/modelos/table/dataTable';
import { trpc } from '@/lib/trpc';
import { TipoEtiqueta } from '@prisma/client';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { generateColumns } from '@/components/modelos/table/columns';
import { Filtro, filterModelos } from '@/lib/filter';

export const useModelosTabla = create<{ cantidad: number; isLoading: boolean }>(
  () => ({
    cantidad: 0,
    isLoading: true,
  })
);

const ModelosTable = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showEventos } = useModelosFiltro((s) => ({
    showEventos: s.showEventos,
  }));
  const [search, setSearch] = useState<Filtro>({
    input: searchParams.get('nombre') ?? '',
    etiquetaId: searchParams.get('etiqueta') ?? undefined,
    grupoId: searchParams.get('grupoId') ?? undefined,
  });

  function goToModel(id: string) {
    router.push(`/modelo/${id}`);
  }

  const {
    data: modelos,
    isLoading,
    isRefetching,
  } = trpc.modelo.getAll.useQuery();

  useEffect(() => {
    setSearch({
      input: searchParams.get('nombre') ?? '',
      etiquetaId: searchParams.get('etiqueta') ?? undefined,
      grupoId: searchParams.get('grupoId') ?? undefined,
    });
  }, [searchParams]);

  const data = useMemo(() => {
    const filtradas = filterModelos(modelos ?? [], search);
    return filtradas;
  }, [search, modelos]);

  useEffect(() => {
    useModelosTabla.setState({
      isLoading,
      cantidad: data.length,
    });
  }, [isLoading, data]);

  return (
    <DataTable
      isLoading={isLoading && !isRefetching}
      columns={generateColumns(showEventos)}
      data={data.map((modelo) => ({
        ...modelo,
        etiquetas: modelo.etiquetas.filter(
          (etiqueta) =>
            etiqueta.tipo !== TipoEtiqueta.MODELO &&
            etiqueta.tipo !== TipoEtiqueta.TENTATIVA
        ),
      }))}
      onClickRow={goToModel}
    />
  );
};

export default ModelosTable;
