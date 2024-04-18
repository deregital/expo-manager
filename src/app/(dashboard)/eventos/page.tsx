'use client';
import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import EventosList from '@/components/eventos/eventoslist';
import SearchInput from '@/components/ui/SearchInput';
import EventoModal from '@/components/eventos/eventomodal';
import Loader from '@/components/ui/loader';
import ExpandContractEventos, { useExpandEventos } from '@/components/eventos/expandcontracteventos';


const EventosPage = () => {
  const [search, setSearch] = useState('');
  const { data: eventos, isLoading } = trpc.evento.getAll.useQuery();
  const { expandState, setNone } = useExpandEventos((s) => ({
    setNone: s.none,
    expandState: s.state,
  }));

  const eventosFiltrados = useMemo(() => {
    if (!eventos) return [];
  
    let filteredEventos = eventos;
  
    if (search !== '') {
      filteredEventos = eventos.filter((evento) => {
        // Filtrar por los eventos que no tienen un evento padre ID
        if (!evento.eventoPadreId) {
          return (
            evento.nombre.toLowerCase().includes(search.toLowerCase()) ||
            evento.ubicacion.toLowerCase().includes(search.toLowerCase()) ||
            evento.subEventos.some((subevento) =>
              subevento.nombre.toLowerCase().includes(search.toLowerCase())
            ) ||
            evento.subEventos.some((subevento) =>
              subevento.ubicacion.toLowerCase().includes(search.toLowerCase())
            )
          );
        }
        return false; // No incluir eventos con evento padre ID
      });
    }
  
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