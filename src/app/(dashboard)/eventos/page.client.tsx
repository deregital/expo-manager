'use client';
import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import SearchInput from '@/components/ui/SearchInput';
import EventModal from '@/components/eventos/modal/eventmodal';
import Loader from '@/components/ui/loader';
import ExpandContractEventos, {
  useExpandEventos,
} from '@/components/eventos/expandcontracteventos';
import { searchNormalize } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import EventsFolderModal from '@/components/eventos/modal/EventsFolderModal';
import EventsList from '@/components/eventos/eventslist';
import SharedCard from '@/components/dashboard/SharedCard';
import { AttendanceChart } from '@/components/eventos/estadisticas/AttendanceChart';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { EventStatsTable } from '@/components/eventos/estadisticas/EventStatsTable';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { TopMailList } from '@/components/eventos/estadisticas/TopMailList';

type EventosPageClientProps = {
  hostname: string;
};

const EventosPageClient = ({ hostname }: EventosPageClientProps) => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = trpc.event.getAll.useQuery();
  const { data: statistics, isLoading: isLoadingStatistics } =
    trpc.event.getAllStatistics.useQuery();
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
    <div>
      {isLoadingStatistics ? (
        <div className='flex h-64 items-center justify-center'>
          <Loader />
        </div>
      ) : (
        <>
          <div className='flex justify-center md:hidden'>
            <Carousel className='relative w-full max-w-[90rem]'>
              <CarouselContent>
                <CarouselItem className=''>
                  <div className='grid grid-cols-2 grid-rows-1 gap-4 p-3'>
                    <section className='h-full rounded-md sm:pb-2'>
                      <SharedCard
                        title='Ingresos Totales'
                        content={'$' + statistics?.totalIncome}
                        isLoading={isLoadingStatistics}
                        popoverText={
                          'Ingresos totales en pesos de todos los eventos incluyendo espectadores y participantes'
                        }
                      />
                    </section>
                    <section className='h-full rounded-md sm:pb-2'>
                      <SharedCard
                        title='Emitidas / Cupo'
                        content={statistics?.attendancePercent + '%'}
                        isLoading={isLoadingStatistics}
                        popoverText={
                          'Porcentaje de entradas emitidas sobre el total de entradas disponibles entre todos los eventos'
                        }
                      />
                    </section>
                  </div>
                </CarouselItem>
                <CarouselItem className=''>
                  <div className='grid grid-cols-1 grid-rows-1 gap-4 p-3'>
                    <AttendanceChart />
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <div className='hidden justify-center md:flex'>
            <Carousel className='relative w-full max-w-[90rem]'>
              <CarouselContent>
                <CarouselItem className=''>
                  <div className='grid grid-cols-3 grid-rows-1 gap-4 p-3'>
                    <section className='h-full rounded-md sm:pb-2'>
                      <SharedCard
                        title='Ingresos Totales'
                        content={'$' + statistics?.totalIncome}
                        isLoading={isLoadingStatistics}
                        popoverText={
                          'Ingresos totales en pesos de todos los eventos incluyendo espectadores y participantes'
                        }
                      />
                    </section>
                    <section className='h-full rounded-md sm:pb-2'>
                      <SharedCard
                        title='Emitidas / Cupo'
                        content={statistics?.attendancePercent + '%'}
                        isLoading={isLoadingStatistics}
                        popoverText={
                          'Porcentaje de entradas emitidas sobre el total de entradas disponibles entre todos los eventos'
                        }
                      />
                    </section>
                    <AttendanceChart />
                  </div>
                </CarouselItem>
                <CarouselItem className=''>
                  <section className='grid grid-cols-2 gap-4 rounded-md p-3 sm:self-end sm:pb-2'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Emails con mas tickets comprados</CardTitle>
                      </CardHeader>
                      <TopMailList
                        mails={statistics!.emailByPurchasedTickets}
                      />
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Eventos: precio unitario y % de venta
                        </CardTitle>
                      </CardHeader>
                      <EventStatsTable
                        events={statistics!.eventDataIndividual}
                      />
                    </Card>
                  </section>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </>
      )}
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
    </div>
  );
};

export default EventosPageClient;
