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
  tagId: string;
  resetFilters: () => void;
}>((set) => ({
  from: startOfMonth(new Date()),
  to: new Date(),
  tagGroupId: '',
  tagId: '',
  resetFilters: () => {
    set({
      from: startOfMonth(new Date()),
      to: new Date(),
      tagGroupId: '',
      tagId: '',
    });
  },
}));

function filterModelos(
  modelos: RouterOutputs['modelo']['getByDateRange'][string],
  search: { tagId?: string; groupId?: string }
) {
  if (search.tagId === '' && search.groupId === '') return modelos;
  // @ts-ignore
  const mod = modelos.filter((modelo) => {
    return (
      (search.tagId === '' ||
        modelo.etiquetas.some((tag) => tag.id === search.tagId)) &&
      (search.groupId === '' ||
        modelo.etiquetas.some((tag) => tag.grupoId === search.groupId))
    );
  });
  return mod;
}

const PageClient = ({}: PageClientProps) => {
  const { from, to, tagId, tagGroupId, resetFilters } = useDashboardData(
    (s) => ({
      from: s.from,
      to: s.to,
      tagId: s.tagId,
      tagGroupId: s.tagGroupId,
      resetFilters: s.resetFilters,
    })
  );

  const [groupOpen, setGroupOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  const { data: tagGroupsData, isLoading: tagGroupsLoading } =
    trpc.tagGroup.getAll.useQuery();
  const { data: tagsData, isLoading: tagsLoading } = trpc.tag.getAll.useQuery();
  const { data: modelosData, isLoading: modelosLoading } =
    trpc.modelo.getByDateRange.useQuery({
      start: format(from, 'yyyy-MM-dd'),
      end: format(addDays(to, 1), 'yyyy-MM-dd'),
    });

  const currentGroup = useMemo(() => {
    if (!tagGroupsData) return;
    return tagGroupsData.find((group) => group.id === tagGroupId);
  }, [tagGroupsData, tagGroupId]);

  const currentTag = useMemo(() => {
    if (!tagsData) return;
    return tagsData.find((tag) => tag.id === tagId);
  }, [tagsData, tagId]);

  const tags = useMemo(() => {
    if (!currentGroup) return tagsData;
    return tagsData ? tagsData.filter((tag) => tag.groupId === tagGroupId) : [];
  }, [currentGroup, tagsData, tagGroupId]);

  const modelosParaGrafico = useMemo(() => {
    const modReturn: { fecha: string; modelos: number }[] = [];
    if (!modelosData) return [];

    for (const [day, modelos] of Object.entries(modelosData)) {
      const modelosFiltradas = filterModelos(modelos, {
        tagId,
        groupId: tagGroupId,
      });

      modReturn.push({ modelos: modelosFiltradas.length, fecha: day });
    }
    return modReturn;
  }, [modelosData, tagId, tagGroupId]);

  const modelosQueCuentan = useMemo(() => {
    if (!modelosData) return [];
    const mod = Object.values(modelosData ?? {}).flatMap((m) => m);
    if (!tagId && !tagGroupId) {
      return mod;
    }
    return filterModelos(mod, { tagId, groupId: tagGroupId });
  }, [modelosData, tagId, tagGroupId]);

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
              useDashboardData.setState({ tagId: '' });
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
          data={tags ?? []}
          id='id'
          open={tagOpen}
          setOpen={setTagOpen}
          onSelect={(value) => {
            if (value === tagId) {
              useDashboardData.setState({ tagId: '' });
            } else {
              useDashboardData.setState({ tagId: value });
            }
            setTagOpen(false);
          }}
          selectedIf={tagId ?? ''}
          value='name'
          triggerChildren={
            <>
              <span className='max-w-[calc(100%-30px)] truncate'>
                {tagId ? currentTag?.name : 'Buscar etiqueta...'}
              </span>
            </>
          }
          isLoading={tagsLoading}
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
