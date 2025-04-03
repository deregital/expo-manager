'use client';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { ArrowLeftIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryState } from 'nuqs';

import { type TicketType } from 'expo-backend-types';
import Link from 'next/link';
import { useMemo } from 'react';
import TicketTableSection from '@/components/eventos/presentismo/TicketTableSection';

interface PresentismoPageProps {
  eventId: string;
}

const PresentismoPage = ({ eventId }: PresentismoPageProps) => {
  const { data: event, isLoading: isLoadingEvent } =
    trpc.event.getById.useQuery(eventId);

  const { data: tickets } = trpc.ticket.getByEventId.useQuery(eventId);

  const ticketsByType = useMemo(
    () =>
      tickets?.reduce(
        (acc, ticket) => {
          const ticketType = ticket.type as TicketType;
          if (!acc[ticketType]) {
            acc[ticketType] = [];
          }
          acc[ticketType].push(ticket);
          return acc;
        },
        {} as Record<TicketType, typeof tickets>
      ),
    [tickets]
  );

  const [tab, setTab] = useQueryState<Lowercase<TicketType>>('tab', {
    defaultValue: 'participant',
    parse: (value) => {
      if (
        !['participant', 'spectator', 'staff'].includes(value as TicketType)
      ) {
        return 'participant' as Lowercase<TicketType>;
      }
      return value as Lowercase<TicketType>;
    },
  });

  if (isLoadingEvent)
    return (
      <div className='flex items-center justify-center pt-5'>
        <Loader />
      </div>
    );

  return (
    <div>
      <Link href={`/eventos/${eventId}`}>
        <ArrowLeftIcon className='h-10 w-10 pt-3 hover:cursor-pointer' />
      </Link>
      <div className='flex items-center justify-center pb-3'>
        <h1 className='text-3xl font-extrabold'>Presentismo</h1>
      </div>
      <div className='grid auto-rows-auto grid-cols-2 items-center justify-center gap-x-3 pb-3 sm:flex'>
        <h3 className='col-span-2 p-2 text-center text-2xl font-semibold'>
          {event?.name}
        </h3>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {format(event!.date, 'yyyy-MM-dd')}
        </h3>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {event?.location}
        </h3>
      </div>
      <Tabs
        onValueChange={(v) => setTab(v as Lowercase<TicketType>)}
        defaultValue={tab}
      >
        <TabsList>
          <TabsTrigger value='participant'>Participante</TabsTrigger>
          <TabsTrigger value='spectator'>Espectador</TabsTrigger>
          <TabsTrigger value='staff'>Staff</TabsTrigger>
        </TabsList>
        <TabsContent value='participant'>
          <TicketTableSection tickets={ticketsByType?.PARTICIPANT ?? []} />
        </TabsContent>
        <TabsContent value='spectator'>
          <TicketTableSection tickets={ticketsByType?.SPECTATOR ?? []} />
        </TabsContent>
        <TabsContent value='staff'>
          <TicketTableSection tickets={ticketsByType?.STAFF ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PresentismoPage;
