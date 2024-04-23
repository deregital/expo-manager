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

const EventosPage = () => {
  const [search, setSearch] = useState('');
  const { data: eventos, isLoading } = trpc.evento.getAll.useQuery();
  const { expandState, setNone } = useExpandEventos((s) => ({
    setNone: s.none,
    expandState: s.state,
  }));

  const utils = trpc.useUtils();

  const eventosFiltrados = useMemo(() => {
    if (!eventos) return [];

    const invalidateEventoQuery = () => {
      utils.evento.getAll.invalidate();
    };

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
    invalidateEventoQuery();


    return filteredEventos;
  }, [eventos, search]);

  

  return (
    <>
      <p className='p-3 text-xl font-bold md:p-5 md:text-3xl'>
        Gestor de Eventos
      </p>
      <div className='flex flex-col justify-between gap-4 px-3 md:flex-row md:px-5'>
        <div className='flex flex-col gap-4 md:flex-row'>
          <EventoModal action='CREATE' />
        </div>
        <div className='flex items-center gap-x-2'>
          <ExpandContractEventos />
          <SearchInput
            onChange={(value) => {
              setSearch(value);

              if (value === '') {
                setNone();
              } else if (expandState === 'EXPAND') {
                setNone();
              }
            }}
            placeholder='Buscar evento o subevento'
          />
        </div>
      </div>
      <div className='px-3 md:px-5'>
        {isLoading ? (
          <div className='mt-5 flex justify-center'>
            <Loader />
          </div>
        ) : (
          <EventosList eventos={eventosFiltrados} />
        )}
      </div>
    </>
  );
};

export default EventosPage;