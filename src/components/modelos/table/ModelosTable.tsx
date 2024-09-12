import { useModelosFiltro } from '@/components/modelos/FiltroTabla';
import { DataTable } from '@/components/modelos/table/dataTable';
import { trpc } from '@/lib/trpc';
import { TipoEtiqueta } from '@prisma/client';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { generateColumns } from '@/components/modelos/table/columns';
import { Filtro, filterModelos } from '@/lib/filter';
import { useSearchQuery } from '@/lib/useSearchQuery';

export const useModelosTabla = create<{ cantidad: number; isLoading: boolean }>(
  () => ({
    cantidad: 0,
    isLoading: true,
  })
);

const ModelosTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showEventos } = useModelosFiltro((s) => ({
    showEventos: s.showEventos,
  }));

  const inputQuery = useSearchQuery(searchParams, 'input');
  const etiquetaQuery = useSearchQuery(searchParams, 'etiquetas');
  const grupoEtiquetaQuery = useSearchQuery(searchParams, 'grupos');
  const instagramQuery = useSearchQuery(searchParams, 'instagram');
  const mailQuery = useSearchQuery(searchParams, 'mail');
  const dniQuery = useSearchQuery(searchParams, 'dni');
  const generoQuery = useSearchQuery(searchParams, 'genero');
  const telefonoQuery = useSearchQuery(searchParams, 'telefono');

  const [search, setSearch] = useState<Filtro>({
    input: inputQuery ?? '',
    etiquetas: etiquetaQuery ?? [],
    grupos: grupoEtiquetaQuery ?? [],
    condicionalEtiq: 'AND',
    condicionalGrupo: 'AND',
    instagram: instagramQuery,
    mail: mailQuery,
    dni: dniQuery,
    genero: generoQuery,
    telefono: telefonoQuery ?? '',
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
      input: inputQuery ?? '',
      etiquetas: etiquetaQuery ?? [],
      grupos: grupoEtiquetaQuery ?? [],
      condicionalEtiq: 'AND',
      condicionalGrupo: 'AND',
      instagram: instagramQuery,
      mail: mailQuery,
      dni: dniQuery,
      genero: generoQuery,
      telefono: telefonoQuery ?? '',
    });
  }, [
    dniQuery,
    etiquetaQuery,
    generoQuery,
    grupoEtiquetaQuery,
    inputQuery,
    instagramQuery,
    mailQuery,
    searchParams,
    telefonoQuery,
  ]);

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
