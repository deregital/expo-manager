'use client';
import GraficoCard from '@/components/dashboard/GraficoCard';
import MensajesCard from '@/components/dashboard/MensajesCard';
import ModelosList from '@/components/dashboard/ModelosList';
import SharedCard from '@/components/dashboard/SharedCard';
import ComboBox from '@/components/ui/ComboBox';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { MessageJson } from '@/server/types/whatsapp';
import { addDays, format, startOfMonth } from 'date-fns';
import { XIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { create } from 'zustand';

interface PageClientProps {}

export const useDashboardData = create<{
  from: Date;
  to: Date;
  tagGroupId: string;
  etiquetaId: string;
  resetFilters: () => void;
}>((set) => ({
  from: startOfMonth(new Date()),
  to: new Date(),
  tagGroupId: '',
  etiquetaId: '',
  resetFilters: () => {
    set({
      from: startOfMonth(new Date()),
      to: new Date(),
      tagGroupId: '',
      etiquetaId: '',
    });
  },
}));

function filterModelos(
  modelos: RouterOutputs['modelo']['getByDateRange'][string],
  search: { etiquetaId?: string; groupId?: string }
) {
  if (search.etiquetaId === '' && search.groupId === '') return modelos;
  // @ts-ignore
  const mod = modelos.filter((modelo) => {
    return (
      (search.etiquetaId === '' ||
        modelo.etiquetas.some(
          (etiqueta) => etiqueta.id === search.etiquetaId
        )) &&
      (search.groupId === '' ||
        modelo.etiquetas.some(
          (etiqueta) => etiqueta.grupoId === search.groupId
        ))
    );
  });
  return mod;
}

const PageClient = ({}: PageClientProps) => {
  const { from, to, etiquetaId, tagGroupId, resetFilters } = useDashboardData(
    (s) => ({
      from: s.from,
      to: s.to,
      etiquetaId: s.etiquetaId,
      tagGroupId: s.tagGroupId,
      resetFilters: s.resetFilters,
    })
  );

  const [groupOpen, setGroupOpen] = useState(false);
  const [etiquetaOpen, setEtiquetaOpen] = useState(false);

  const { data: tagGroupsData, isLoading: tagGroupsLoading } =
    trpc.tagGroup.getAll.useQuery();
  const { data: etiquetasData, isLoading: etiquetasLoading } =
    trpc.etiqueta.getAll.useQuery();
  const { data: modelosData, isLoading: modelosLoading } =
    trpc.modelo.getByDateRange.useQuery({
      start: format(from, 'yyyy-MM-dd'),
      end: format(addDays(to, 1), 'yyyy-MM-dd'),
    });

  const currentGroup = useMemo(() => {
    if (!tagGroupsData) return;
    return tagGroupsData.find((group) => group.id === tagGroupId);
  }, [tagGroupsData, tagGroupId]);

  const currentEtiqueta = useMemo(() => {
    if (!etiquetasData) return;
    return etiquetasData.find((etiqueta) => etiqueta.id === etiquetaId);
  }, [etiquetasData, etiquetaId]);

  const etiquetas = useMemo(() => {
    if (!currentGroup) return etiquetasData;
    return etiquetasData
      ? etiquetasData.filter((etiqueta) => etiqueta.grupoId === tagGroupId)
      : [];
  }, [currentGroup, etiquetasData, tagGroupId]);

  const modelosParaGrafico = useMemo(() => {
    const modReturn: { fecha: string; modelos: number }[] = [];
    if (!modelosData) return [];

    for (const [day, modelos] of Object.entries(modelosData)) {
      const modelosFiltradas = filterModelos(modelos, {
        etiquetaId,
        groupId: tagGroupId,
      });

      modReturn.push({ modelos: modelosFiltradas.length, fecha: day });
    }
    return modReturn;
  }, [etiquetaId, tagGroupId, modelosData]);

  const modelosQueCuentan = useMemo(() => {
    if (!modelosData) return [];
    const mod = Object.values(modelosData ?? {}).flatMap((m) => m);
    if (!etiquetaId && !tagGroupId) {
      return mod;
    }
    return filterModelos(mod, { etiquetaId, groupId: tagGroupId });
  }, [etiquetaId, tagGroupId, modelosData]);

  const retencion = useMemo(() => {
    return (
      (modelosQueCuentan.filter((modelo) =>
        // @ts-ignore
        modelo.mensajes.filter((m) => 'from' in (m.message as MessageJson))
      ).length /
        modelosQueCuentan.length) *
      100
    );
  }, [modelosQueCuentan]);

  return (
    <>
      <section className='grid-in-calendar'>
        <DateRangePicker
          align='start'
          value={{
            from,
            to,
          }}
          showCompare={false}
          initialDateFrom={from}
          initialDateTo={to}
          locale='es-AR'
          onUpdate={({ range }) => {
            useDashboardData.setState({
              from: range.from,
              to: range.to
                ? new Date(addDays(range.to, 1).getTime() - 1000)
                : new Date(addDays(new Date(), 1).getTime() - 1000),
            });
          }}
        />
      </section>
      <section className='w-full grid-in-grupo'>
        <ComboBox
          data={tagGroupsData ?? []}
          id='id'
          open={groupOpen}
          setOpen={setGroupOpen}
          onSelect={(value) => {
            if (value === tagGroupId) {
              useDashboardData.setState({ tagGroupId: '' });
            } else {
              useDashboardData.setState({ tagGroupId: value });
              useDashboardData.setState({ etiquetaId: '' });
            }
            setGroupOpen(false);
          }}
          selectedIf={tagGroupId}
          value='name'
          triggerChildren={
            <>
              <span className='max-w-[calc(100%-30px)] truncate'>
                {tagGroupId ? currentGroup?.name : 'Buscar grupo...'}
              </span>
            </>
          }
          isLoading={tagGroupsLoading}
          wFullMobile
          buttonClassName='w-full sm:min-w-full h-[44px]'
          contentClassName='sm:max-w-[--radix-popper-anchor-width]'
        />
      </section>
      <section className='flex w-full items-center gap-x-2 self-start grid-in-etiqueta'>
        <ComboBox
          data={etiquetas ?? []}
          id='id'
          open={etiquetaOpen}
          setOpen={setEtiquetaOpen}
          onSelect={(value) => {
            if (value === etiquetaId) {
              useDashboardData.setState({ etiquetaId: '' });
            } else {
              useDashboardData.setState({ etiquetaId: value });
            }
            setEtiquetaOpen(false);
          }}
          selectedIf={etiquetaId ?? ''}
          value='nombre'
          triggerChildren={
            <>
              <span className='max-w-[calc(100%-30px)] truncate'>
                {etiquetaId ? currentEtiqueta?.nombre : 'Buscar etiqueta...'}
              </span>
            </>
          }
          isLoading={etiquetasLoading}
          wFullMobile
          buttonClassName='w-full sm:min-w-[calc(100%-2rem)] h-[44px]'
          contentClassName='sm:max-w-[--radix-popper-anchor-width]'
        />
        <XIcon
          className='h-4 w-4 cursor-pointer'
          onClick={() => {
            resetFilters();
          }}
        />
      </section>
      <section className='rounded-md grid-in-grafico sm:h-full'>
        <GraficoCard isLoading={modelosLoading} modelos={modelosParaGrafico} />
      </section>
      <section className='rounded-md grid-in-listaModelos sm:h-full sm:max-h-full'>
        <ModelosList
          isLoading={modelosLoading}
          modelos={modelosQueCuentan
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 20)}
        />
      </section>
      <section className='rounded-md grid-in-cardModelos sm:self-end sm:pb-2'>
        <SharedCard
          popoverText='Cantidad de participantes que cuentan con la etiqueta seleccionada'
          title='Participantes'
          content={modelosQueCuentan.length.toString()}
          isLoading={modelosLoading}
        />
      </section>
      <section className='rounded-md grid-in-cardRetencion sm:self-end sm:pb-2'>
        <SharedCard
          popoverText='Porcentaje de participantes que aceptaron ser contactados'
          title='Retención de participantes'
          content={
            isNaN(retencion)
              ? '0%'
              : retencion % 1 === 0
                ? `${retencion}%`
                : `${retencion.toFixed(2)}%`
          }
          isLoading={modelosLoading}
        />
      </section>
      <section className='rounded-md pb-2 grid-in-cardMensajes sm:self-end'>
        <MensajesCard isLoading={modelosLoading} cantMensajes={0} />
      </section>
    </>
  );
};

export default PageClient;
