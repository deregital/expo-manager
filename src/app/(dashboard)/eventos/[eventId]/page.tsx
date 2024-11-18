'use client';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import { ArrowLeftIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from '@/components/modelos/table/dataTable';
import { generateColumns } from '@/components/eventos/table/columnsEvento';
import RaiseHand from '@/components/icons/RaiseHand';
import Filter from '@/components/ui/filtro/Filtro';
import { type FuncionFiltrar, filterProfiles } from '@/lib/filter';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

const EventPage = ({ params }: EventPageProps) => {
  const { data: event, isLoading: isLoadingEvent } =
    trpc.event.getById.useQuery(params.eventId);
  const { data: profiles } = trpc.profile.getAll.useQuery();

  const router = useRouter();
  const [profilesData, setprofilesData] = useState<
    RouterOutputs['profile']['getAll']
  >(profiles ?? []);

  const filter: FuncionFiltrar = (filter) => {
    if (!profiles) return;
    setprofilesData(filterProfiles(profiles, filter));
  };

  if (isLoadingEvent)
    return (
      <div className='flex items-center justify-center pt-5'>
        <Loader />
      </div>
    );

  return (
    <div className=''>
      <div>
        <ArrowLeftIcon
          className='h-10 w-10 pt-3 hover:cursor-pointer'
          onClick={() => {
            window.history.back();
          }}
        />
      </div>
      <div className='grid auto-rows-auto grid-cols-3 items-center justify-center gap-x-3 pb-3 sm:flex'>
        <div className='col-span-3 p-2'>
          <h3 className='text-center text-2xl font-bold'>{event?.name}</h3>
        </div>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {format(event!.date, 'yyyy-MM-dd')}
        </h3>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {event?.location}
        </h3>

        <Button
          className='aspect-square justify-self-center rounded-lg bg-gray-400 px-3 py-1.5 text-xl font-bold text-black hover:bg-gray-500'
          onClick={() => router.push(`/eventos/${event?.id}/presentismo`)}
        >
          <RaiseHand />
        </Button>
      </div>
      <div className='flex items-center justify-center gap-x-2 px-2 pb-5'>
        {/* <SearchInput
          onChange={setSearch}
          placeholder='Buscar por nombre o ID legible'
        /> */}
        <Filter showInput showTag filterFunction={filter} />
      </div>
      <DataTable
        columns={generateColumns(event!.tagConfirmedId, event!.tagAssistedId)}
        data={profilesData}
        initialSortingColumn={{ id: 'created_at', desc: true }}
      />
    </div>
  );
};

export default EventPage;
