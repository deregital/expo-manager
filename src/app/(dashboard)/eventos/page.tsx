'use client';
import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import SearchInput from '@/components/ui/SearchInput';
import EventoModal from '@/components/eventos/eventomodal';
import Loader from '@/components/ui/loader';
import ExpandContractEventos, {
  useExpandEventos,
} from '@/components/eventos/expandcontracteventos';
import { searchNormalize } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import EventosCarpetaModal from '@/components/eventos/EventosCarpetaModal';
import EventosList from '@/components/eventos/eventoslist';

const EventosPage = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = trpc.evento.getAll.useQuery();
  const { expandState, setNone } = useExpandEventos((s) => ({
    setNone: s.none,
    expandState: s.state,
  }));

  const { carpetas, sinCarpetas: eventosSinCarpeta } = isLoading
    ? { carpetas: [], sinCarpetas: [] }
    : data!;

  const eventosFiltrados = useMemo(() => {
    if (isLoading) return { carpetas: [], sinCarpetas: [] };

    let filteredCarpetas = carpetas.filter((carp) => {
      return (
        searchNormalize(carp.nombre, search) ||
        carp.eventos.some((evento) => {
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
        })
      );
    });

    let filteredEventosSinCarpeta = eventosSinCarpeta.filter((evento) => {
      return !evento.eventoPadreId;
    });

    if (search !== '') {
      filteredEventosSinCarpeta = eventosSinCarpeta.filter((evento) => {
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

    const eventosOrdenados = {
      carpetas: filteredCarpetas.sort((a, b) => {
        return a.nombre.localeCompare(b.nombre);
      }),
      sinCarpetas: filteredEventosSinCarpeta.sort((a, b) => {
        return a.nombre.localeCompare(b.nombre);
      }),
    };

    return eventosOrdenados;
  }, [carpetas, eventosSinCarpeta, isLoading, search]);

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
            <EventosList eventos={eventosFiltrados} />
          </div>
        )}
      </div>
    </>
  );
};

export default EventosPage;
