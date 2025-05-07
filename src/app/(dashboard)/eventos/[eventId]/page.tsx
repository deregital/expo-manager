'use client';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from 'lucide-react';
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
import LocationIcon from '@/components/icons/LocationIcon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import InfoIcon from '@/components/icons/InfoIcon';
import { type TicketType } from 'expo-backend-types';
import { iconsAndTexts } from '@/components/ui/ticket/iconsAndTexts';
import { cn, objectEntries } from '@/lib/utils';
import Link from 'next/link';

import { StatisticsCarouselSpecific } from '@/components/eventos/estadisticas/StatisticsCarouselSpecific';

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
    event?.profileTags.map((t) => t.id) ?? [],
    {
      enabled: !!event,
      onSuccess(data) {
        setProfilesData(data);
      },
    }
  );

  const toggleActiveMutation = trpc.event.toggleActive.useMutation();
  const utils = trpc.useUtils();

  const [sureActivate, setSureActivate] = useState(false);
  const [profilesData, setProfilesData] = useState<
    RouterOutputs['profile']['getByTags']
  >([]);
  const eventTicketsTotal = useMemo(
    () =>
      event?.eventTickets.reduce((acc, curr) => {
        if (curr.amount === null) {
          return acc;
        } else {
          return acc + curr.amount;
        }
      }, 0),
    [event]
  );
  const ticketsTotal = useMemo(
    () =>
      event?.tickets.reduce((acc, curr) => {
        const eventTicket = event.eventTickets.find(
          (et) => et.type === curr.type
        );

        if (eventTicket?.amount === null) {
          return acc;
        }
        return acc + 1;
      }, 0),
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
    <div>
      <div>
        <ArrowLeftIcon
          className='h-10 w-10 pt-3 hover:cursor-pointer'
          onClick={() => {
            router.push('/eventos');
          }}
        />
      </div>
      {event && (
        <StatisticsCarouselSpecific
          eventId={params.eventId}
          startingDate={event.startingDate}
          endingDate={event.endingDate}
        />
      )}
      <div className='col-span-3 p-2'>
        <h3 className='text-center text-2xl font-bold'>{event?.name}</h3>
      </div>
      <div className='flex flex-wrap items-center justify-center gap-x-3 pb-3'>
        <h3 className='flex items-center gap-x-1 p-2 text-center align-middle text-sm sm:text-base'>
          <CalendarIcon className='inline h-5 w-5' />
          {format(event!.startingDate, 'dd/MM/yyyy')}
        </h3>
        <h3 className='flex items-center gap-x-1 p-2 text-center align-middle text-sm sm:text-base'>
          <ClockIcon className='inline h-5 w-5' />
          {format(event!.startingDate, 'HH:mm')} -{' '}
          {format(event!.endingDate, 'HH:mm')}
        </h3>
        <h3 className='flex items-center p-2 text-center text-sm sm:text-base'>
          <LocationIcon className='inline h-5 w-5' />
          {event?.location}
        </h3>

        <Button
          asChild
          title='Presentismo'
          className='aspect-square justify-self-center rounded-lg bg-gray-400 px-3 py-1.5 text-xl font-bold text-black hover:bg-gray-500'
        >
          <Link href={`/eventos/${event?.id}/presentismo`}>
            <RaiseHand />
          </Link>
        </Button>
        <p className='flex items-center gap-x-0.5'>
          Tickets emitidos: {ticketsTotal} de {eventTicketsTotal}
          <InfoPopover
            eventTickets={event!.eventTickets}
            tickets={ticketsData ?? []}
          />
        </p>
      </div>
      <div className='flex items-center justify-center'>
        <Button
          variant={event?.active ? 'destructive' : 'default'}
          className={cn(
            sureActivate && event?.active ? 'bg-red-600 hover:bg-red-700' : '',
            sureActivate && !event?.active
              ? 'bg-slate-900 hover:bg-slate-950'
              : ''
          )}
          onClick={() => {
            if (!sureActivate) {
              setSureActivate(true);
              return;
            }
            toggleActiveMutation.mutate(event?.id ?? '');
            utils.event.getById.invalidate();
            utils.ticket.getByEventId.invalidate(params.eventId);
            setSureActivate(false);
          }}
          disabled={
            toggleActiveMutation.isLoading ||
            ((ticketsData ?? []).length > 0 && event!.active)
          }
        >
          {sureActivate
            ? event?.active
              ? 'Seguro que quieres desactivar?'
              : 'Seguro que quieres activar?'
            : event?.active
              ? 'Desactivar'
              : 'Activar'}
        </Button>
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
              event?.profileTags.map((t) => t.id) ?? [],
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

interface InfoPopoverProps {
  eventTickets: RouterOutputs['event']['getById']['eventTickets'];
  tickets: RouterOutputs['ticket']['getByEventId'];
}

const InfoPopover = ({ eventTickets, tickets }: InfoPopoverProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  // { VIP: {total: 2, emitted: 1}, Regular: {total: 3, emitted: 2} }
  const totalPerType = eventTickets.reduce(
    (acc, curr) => {
      acc[curr.type] = acc[curr.type] ?? {
        total: curr.amount,
        emitted: tickets.filter((t) => t.type === curr.type).length,
      };
      return acc;
    },
    {} as Record<TicketType, { total: number; emitted: number }>
  );

  const handleMouseEnter = () => {
    setPopoverOpen(true);
  };

  const handleMouseLeave = () => {
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen}>
      <PopoverTrigger
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='flex items-center justify-center outline-none'
      >
        <InfoIcon className='inline size-5 place-self-center' />
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='mt-3 w-72 text-balance border-2 border-stone-300 bg-white px-5 text-center shadow-md shadow-black/50 xl:-top-full xl:left-10 xl:right-0 2xl:w-80'
        sideOffset={5}
      >
        {
          <ul className='list-inside list-disc'>
            {objectEntries(totalPerType).map(([type, { total, emitted }]) => (
              <li key={type}>
                {iconsAndTexts[type].text}: {emitted} de{' '}
                {type === 'STAFF' ? '∞' : total}
              </li>
            ))}
          </ul>
        }
      </PopoverContent>
    </Popover>
  );
};
