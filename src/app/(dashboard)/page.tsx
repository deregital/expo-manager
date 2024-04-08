'use client';

import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { addDays, dateFormatYYYYMMDD } from '@/lib/utils';
import { create } from 'zustand';

export const useDashboardData = create<{
  from: string;
  to: string;
  etiquetaId: string | null;
}>(() => ({
  from: dateFormatYYYYMMDD(new Date()),
  to: dateFormatYYYYMMDD(addDays(new Date().toISOString(), 1)),
  etiquetaId: null,
}));

const Home = () => {
  const { from, to } = useDashboardData();

  return (
    <main className='grid h-full grid-cols-1 grid-rows-[10%,auto,25%] gap-2 p-5 grid-areas-dashboardSmall sm:grid-cols-3 sm:grid-areas-dashboardLarge'>
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
        <div className='h-full w-full rounded-md bg-white shadow-md'>
          Grupo dropdown
        </div>
      </section>
      <section className='w-full grid-in-etiqueta'>
        <div className='h-full w-full rounded-md bg-white shadow-md'>
          Etiqueta dropdown
        </div>
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
