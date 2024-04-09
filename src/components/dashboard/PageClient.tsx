import MensajesCard from '@/components/dashboard/MensajesCard';
import ModelosCard from '@/components/dashboard/ModelosCard';
import RetencionCard from '@/components/dashboard/RetencionCard';
import ComboBox from '@/components/ui/ComboBox';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { trpc } from '@/lib/trpc';
import { dateFormatYYYYMMDD } from '@/lib/utils';
import { addDays } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { create } from 'zustand';

interface PageClientProps {}

export const useDashboardData = create<{
  from: Date;
  to: Date;
  grupoEtiquetaId: string;
  etiquetaId: string | undefined;
}>(() => ({
  from: new Date(),
  to: addDays(new Date().toISOString(), 1),
  grupoEtiquetaId: '',
  etiquetaId: undefined,
}));

const PageClient = ({}: PageClientProps) => {
  const { from, to, etiquetaId, grupoEtiquetaId } = useDashboardData((s) => ({
    from: s.from,
    to: s.to,
    etiquetaId: s.etiquetaId,
    grupoEtiquetaId: s.grupoEtiquetaId,
  }));

  const [grupoOpen, setGrupoOpen] = useState(false);
  const [etiquetaOpen, setEtiquetaOpen] = useState(false);

  const { data: grupoEtiquetasData, isLoading: grupoEtiquetasLoading } =
    trpc.grupoEtiqueta.getAll.useQuery();
  const { data: etiquetasData, isLoading: etiquetasLoading } =
    trpc.etiqueta.getAll.useQuery();
  const { data: modelosData, isLoading: modelosLoading } =
    trpc.modelo.getByDateRange.useQuery({
      start: dateFormatYYYYMMDD(from),
      end: dateFormatYYYYMMDD(to),
      etiquetaId: etiquetaId,
    });

  const currentGrupo = useMemo(() => {
    if (!grupoEtiquetasData) return;
    return grupoEtiquetasData.find((grupo) => grupo.id === grupoEtiquetaId);
  }, [grupoEtiquetasData, grupoEtiquetaId]);

  const currentEtiqueta = useMemo(() => {
    if (!etiquetasData) return;
    return etiquetasData.find((etiqueta) => etiqueta.id === etiquetaId);
  }, [etiquetasData, etiquetaId]);

  const etiquetas = useMemo(() => {
    if (!currentGrupo) return etiquetasData;
    return etiquetasData
      ? etiquetasData.filter((etiqueta) => etiqueta.grupoId === grupoEtiquetaId)
      : [];
  }, [currentGrupo, etiquetasData, grupoEtiquetaId]);
  return (
    <>
      <section className='grid-in-calendar'>
        <DateRangePicker
          align='start'
          showCompare={false}
          initialDateFrom={from}
          initialDateTo={to}
          locale='es-AR'
          onUpdate={({ range }) => {
            useDashboardData.setState({ from: range.from });
            useDashboardData.setState({
              to: range.to ? range.to : addDays(new Date(), 1),
            });
          }}
        />
      </section>
      <section className='w-full grid-in-grupo'>
        <ComboBox
          data={grupoEtiquetasData ?? []}
          id='id'
          open={grupoOpen}
          setOpen={setGrupoOpen}
          onSelect={(value) => {
            if (value === grupoEtiquetaId) {
              useDashboardData.setState({ grupoEtiquetaId: '' });
            } else {
              useDashboardData.setState({ grupoEtiquetaId: value });
              useDashboardData.setState({ etiquetaId: '' });
            }
            setGrupoOpen(false);
          }}
          selectedIf={grupoEtiquetaId}
          value='nombre'
          triggerChildren={
            <>
              <span className='max-w-[calc(100%-30px)] truncate'>
                {grupoEtiquetaId ? currentGrupo?.nombre : 'Buscar grupo...'}
              </span>
            </>
          }
          isLoading={grupoEtiquetasLoading}
          wFullMobile
          buttonClassName='w-full sm:min-w-full h-[44px]'
          contentClassName='sm:max-w-[--radix-popper-anchor-width] sm:w-full max-h-min'
        />
      </section>
      <section className='w-full grid-in-etiqueta'>
        <ComboBox
          data={etiquetas ?? []}
          id='id'
          open={etiquetaOpen}
          setOpen={setEtiquetaOpen}
          onSelect={(value) => {
            useDashboardData.setState({ etiquetaId: value });
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
          buttonClassName='w-full sm:min-w-full h-[44px]'
          contentClassName='sm:max-w-[--radix-popper-anchor-width]'
        />
      </section>
      <section className='rounded-md bg-red-500 shadow-md grid-in-grafico'>
        Grafico
      </section>
      <section className='rounded-md bg-green-500 shadow-md grid-in-listaModelos'>
        Lista de modelos
      </section>
      <section className='rounded-md grid-in-cardModelos sm:self-end'>
        <ModelosCard isLoading={modelosLoading} modelos={modelosData} />
      </section>
      <section className='rounded-md grid-in-cardRetencion sm:self-end'>
        <RetencionCard isLoading={modelosLoading} modelos={modelosData} />
      </section>
      <section className='rounded-md grid-in-cardMensajes sm:self-end'>
        <MensajesCard isLoading={modelosLoading} cantMensajes={0} />
      </section>
    </>
  );
};

export default PageClient;
