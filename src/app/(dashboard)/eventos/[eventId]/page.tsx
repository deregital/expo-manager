'use client';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import { ArrowLeftIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/modelos/table/dataTable';
import {
  generateParticipantColumns,
  generateTicketColumns,
} from '@/components/eventos/table/columnsEvento';
import RaiseHand from '@/components/icons/RaiseHand';
import Filter from '@/components/ui/filtro/Filtro';
import { type FuncionFiltrar, filterProfiles } from '@/lib/filter';
import CreateTicketModal from '@/components/eventos/modal/CreateTicketModal';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

const EventPage = ({ params }: EventPageProps) => {
  const { data: event, isLoading: isLoadingEvent } =
    trpc.event.getById.useQuery(params.eventId);
  const { data: ticketsData } = trpc.ticket.getByEventId.useQuery(
    params.eventId
  );
  const { data: profiles } = trpc.profile.getByTags.useQuery(
    event?.tags.map((t) => t.id) ?? [],
    {
      enabled: !!event,
      onSuccess(data) {
        setProfilesData(data);
      },
    }
  );

  const [profilesData, setProfilesData] = useState<
    RouterOutputs['profile']['getByTags']
  >([]);
  const eventTicketsTotal = useMemo(
    () => event?.eventTickets.reduce((acc, curr) => acc + curr.amount, 0),
    [event]
  );

  const router = useRouter();

  const filter: FuncionFiltrar = (filter) => {
    if (!profiles) return;
    setProfilesData(filterProfiles(profiles, filter));
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
            router.push('/eventos');
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
        <p>
          Tickets emitidos: {ticketsData?.length} de {eventTicketsTotal}
        </p>
      </div>
      <div className='flex items-center justify-center gap-x-2 px-2 pb-5'>
        <Filter showInput showTag filterFunction={filter} />
      </div>
      <div className='flex flex-col gap-2 md:flex-row [&>*]:flex-1'>
        <div>
          <h3 className='py-2 text-center text-xl font-bold'>
            Participantes invitados
          </h3>
          <DataTable
            columns={generateParticipantColumns(
              event?.tags.map((t) => t.id) ?? [],
              ticketsData ?? []
            )}
            data={profilesData}
            initialSortingColumn={{ id: 'fullName', desc: true }}
          />
        </div>
        <div>
          <div className='relative w-full py-2'>
            <h3 className='text-center text-xl font-bold'>Tickets emitidos</h3>
            <CreateTicketModal eventId={event!.id} eventName={event!.name} />
          </div>
          <DataTable
            columns={generateTicketColumns()}
            data={ticketsData ?? []}
            initialSortingColumn={{ id: 'type', desc: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default EventPage;
