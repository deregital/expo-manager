'use client';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryState } from 'nuqs';

import { type TicketType } from 'expo-backend-types';

interface PresentismoPageProps {
  eventId: string;
}

const PresentismoPage = ({ eventId }: PresentismoPageProps) => {
  const router = useRouter();
  const { data: event, isLoading: isLoadingEvent } =
    trpc.event.getById.useQuery(eventId);

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
      <div>
        <ArrowLeftIcon
          className='h-10 w-10 pt-3 hover:cursor-pointer'
          onClick={() => {
            router.replace(`/eventos/${eventId}`);
          }}
        />
      </div>
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
        <TabsContent value='participant'>PARTICIPANTE</TabsContent>
        <TabsContent value='spectator'>ESPECTADOR</TabsContent>
        <TabsContent value='staff'>STAFF</TabsContent>
      </Tabs>
    </div>
  );
};

export default PresentismoPage;
