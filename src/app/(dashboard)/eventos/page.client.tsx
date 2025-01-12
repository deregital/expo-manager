'use client';
import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import SearchInput from '@/components/ui/SearchInput';
import EventModal from '@/components/eventos/eventmodal';
import Loader from '@/components/ui/loader';
import ExpandContractEventos, {
  useExpandEventos,
} from '@/components/eventos/expandcontracteventos';
import { searchNormalize } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import EventsFolderModal from '@/components/eventos/EventsFolderModal';
import EventsList from '@/components/eventos/eventslist';

type EventosPageClientProps = {
  hostname: string;
};

const EventosPageClient = ({ hostname }: EventosPageClientProps) => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = trpc.event.getAll.useQuery();
  const { expandState, setNone } = useExpandEventos((s) => ({
    setNone: s.none,
    expandState: s.state,
  }));

  const { folders: folders, withoutFolder: eventsWithoutFolder } = isLoading
    ? { folders: [], withoutFolder: [] }
    : data!;

  const eventsFiltered = useMemo(() => {
    if (isLoading) return { folders: [], withoutFolder: [] };

    let filteredFolders = folders.filter((folder) => {
      return (
        searchNormalize(folder.name, search) ||
        folder.events.some((event) => {
          return (
            searchNormalize(event.name, search) ||
            searchNormalize(event.location, search) ||
            event.subEvents.some((subevent) =>
              searchNormalize(subevent.name, search)
            ) ||
            event.subEvents.some((subevent) =>
              searchNormalize(subevent.location, search)
            )
          );
        })
      );
    });

    let filteredEventsWithoutFolder = eventsWithoutFolder.filter((event) => {
      return !event.supraEventId;
    });

    if (search !== '') {
      filteredEventsWithoutFolder = eventsWithoutFolder.filter((event) => {
        return (
          searchNormalize(event.name, search) ||
          searchNormalize(event.location, search) ||
          event.subEvents.some((subevent) =>
            searchNormalize(subevent.name, search)
          ) ||
          event.subEvents.some((subevent) =>
            searchNormalize(subevent.location, search)
          )
        );
      });
    }

    const orderedEvents = {
      folders: filteredFolders.sort((a, b) => {
        return a.name.localeCompare(b.name);
      }),
      withoutFolder: filteredEventsWithoutFolder.sort((a, b) => {
        return a.name.localeCompare(b.name);
      }),
    };

    return orderedEvents;
  }, [folders, eventsWithoutFolder, isLoading, search]);

  return (
    <>
      <p className='p-3 text-xl font-bold md:p-5 md:text-3xl'>
        Gestor de Eventos
      </p>
      <div className='flex flex-col justify-between gap-4 px-3 md:flex-row md:px-5'>
        <div className='flex flex-col gap-4 md:flex-row'>
          <EventModal action='CREATE' />
          <EventsFolderModal action='CREATE' /> {}
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
            className='pr-1.5'
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
            <EventsList baseUrl={hostname} events={eventsFiltered} />
          </div>
        )}
      </div>
    </>
  );
};

export default EventosPageClient;
