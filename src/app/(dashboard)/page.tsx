'use client';

import ComboBox from '@/components/ui/ComboBox';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { trpc } from '@/lib/trpc';
import { addDays, dateFormatYYYYMMDD } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { create } from 'zustand';

export const useDashboardData = create<{
  from: string;
  to: string;
  grupoEtiquetaId: string;
  etiquetaId: string;
}>(() => ({
  from: dateFormatYYYYMMDD(new Date()),
  to: dateFormatYYYYMMDD(addDays(new Date().toISOString(), 1)),
  grupoEtiquetaId: '',
  etiquetaId: '',
}));

const Home = () => {
  const { from, to, etiquetaId, grupoEtiquetaId } = useDashboardData((s) => s);
  const [grupoOpen, setGrupoOpen] = useState(false);
  const [etiquetaOpen, setEtiquetaOpen] = useState(false);
  const { data: grupoEtiquetasData, isLoading: grupoEtiquetasLoading } =
    trpc.grupoEtiqueta.getAll.useQuery();

  const { data: etiquetasData, isLoading: etiquetasLoading } =
    trpc.etiqueta.getAll.useQuery();

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
    <main className='grid h-full grid-cols-1 grid-rows-[repeat(8,minmax(0,min-content))] gap-2 p-5 grid-areas-dashboardSmall sm:grid-cols-3 sm:grid-rows-[10%,auto,25%] sm:grid-areas-dashboardLarge [&_section]:h-min sm:[&_section]:h-auto'>
      <section className='grid-in-calendar'>
        <DateRangePicker
          align='start'
          showCompare={false}
          initialDateFrom={from}
          initialDateTo={to}
          locale='es-AR'
        />
      </section>
      <section className='w-full grid-in-grupo'>
        <ComboBox
          data={grupoEtiquetasData ?? []}
          id='id'
          open={grupoOpen}
          setOpen={setGrupoOpen}
          onSelect={(value) => {
            useDashboardData.setState({ grupoEtiquetaId: value });
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
          selectedIf={etiquetaId}
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
      <section className='rounded-md bg-yellow-500 shadow-md grid-in-cardModelos'>
        Card Modelos participando
      </section>
      <section className='rounded-md bg-blue-500 shadow-md grid-in-cardRetencion'>
        Card Retención de modelos
      </section>
      <section className='rounded-md bg-cyan-500 shadow-md grid-in-cardMensajes'>
        Card Mensajes
      </section>
    </main>
  );
};

export default Home;
