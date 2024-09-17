'use client';
import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import EventosList from '@/components/eventos/eventoslist';
import SearchInput from '@/components/ui/SearchInput';
import EventoModal from '@/components/eventos/eventomodal';
import Loader from '@/components/ui/loader';
import ExpandContractEventos, {
  useExpandEventos,
} from '@/components/eventos/expandcontracteventos';
import { searchNormalize } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import EventosCarpetaModal from '@/components/eventos/EventosCarpetaModal';

const EventosPage = () => {
  const [search, setSearch] = useState('');
  const { data: eventos, isLoading } = trpc.evento.getAll.useQuery();
  const { expandState, setNone } = useExpandEventos((s) => ({
    setNone: s.none,
    expandState: s.state,
  }));

  const eventosFiltrados = useMemo(() => {
    if (!eventos) return [];

    let filteredEventos = eventos.filter((evento) => !evento.eventoPadreId);

    if (search !== '') {
      filteredEventos = filteredEventos.filter((evento) => {
        return (
          searchNormalize(evento.nombre, search) ||
          searchNormalize(evento.ubicacion, search) ||
          evento.subEventos.some((subevento) =>
            searchNormalize(subevento.nombre, search)
          ) ||
          evento.subEventos.some((subevento) =>
            searchNormalize(subevento.ubicacion, search)
          )
        );
      });
    }

    const eventosConCarpeta = filteredEventos.filter(
      (evento) => evento.carpetaId
    );
    const eventosSinCarpeta = filteredEventos.filter(
      (evento) => !evento.carpetaId
    );

    const eventosOrdenados = eventosConCarpeta.concat(eventosSinCarpeta);

    return eventosOrdenados.sort((a, b) => {
      if (a.fecha < b.fecha) return -1;
      if (a.fecha > b.fecha) return 1;
      return 0;
    });
  }, [eventos, search]);

  return (
    <>
      <p className='p-3 text-xl font-bold md:p-5 md:text-3xl'>
        Gestor de Eventos
      </p>
      <div className='flex flex-col justify-between gap-4 px-3 md:flex-row md:px-5'>
        <div className='flex flex-col gap-4 md:flex-row'>
          <EventoModal action='CREATE' />
          <EventosCarpetaModal action='CREATE' /> {}
        </div>
        <div className='flex items-center gap-x-2'>
          <ExpandContractEventos />

          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);

              if (value === '') {
                setNone();
              } else if (expandState === 'EXPAND') {
                setNone();
              }
            }}
            placeholder='Buscar evento o subevento'
            className='pr-5'
          />
          <XIcon
            className='h-6 w-6 cursor-pointer'
            onClick={() => {
              setSearch('');
            }}
          />
        </div>
      </div>
      <div className='px-3 md:px-5'>
        {isLoading ? (
          <div className='mt-5 flex justify-center'>
            <Loader />
          </div>
        ) : (
          <div>
            {eventosFiltrados.map((evento) => (
              <div key={evento.id} className='mb-5'>
                {}
                {evento.carpetaId && (
                  <p className='text-lg font-semibold'>
                    Carpeta: {evento.carpetaId} {}
                  </p>
                )}
                {}
                <EventosList eventos={[evento]} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default EventosPage;
