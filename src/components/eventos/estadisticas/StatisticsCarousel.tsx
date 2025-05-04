import SharedCard from '@/components/dashboard/SharedCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { TopMailList } from './TopMailList';
import { AttendanceChart } from './AttendanceChart';
import { EventStatsTable } from './EventStatsTable';

export const StatisticsCarousel = () => {
  const { data: statistics, isLoading: isLoadingStatistics } =
    trpc.event.getAllStatistics.useQuery();

  return isLoadingStatistics ? (
    <div className='flex h-64 items-center justify-center'>
      <Loader />
    </div>
  ) : (
    <>
      <div className='flex justify-center md:hidden'>
        <Carousel className='relative w-full max-w-[90rem]'>
          <CarouselContent>
            <CarouselItem>
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
            <CarouselItem>
              <div className='grid grid-cols-1 grid-rows-1 gap-4 p-3'>
                <AttendanceChart
                  data={statistics!.emmitedticketPerTypeAll}
                  title='Emitidos por tipo'
                />
              </div>
            </CarouselItem>
            <CarouselItem>
              <section className='grid grid-cols-1 rounded-md p-3 sm:self-end sm:pb-2'>
                <Card>
                  <CardHeader>
                    <CardTitle>Emails con mas tickets comprados</CardTitle>
                  </CardHeader>
                  <TopMailList mails={statistics!.emailByPurchasedTickets} />
                </Card>
              </section>
            </CarouselItem>
            <CarouselItem>
              <section className='grid grid-cols-1 rounded-md p-3 sm:self-end sm:pb-2'>
                <Card>
                  <CardHeader>
                    <CardTitle>Eventos: precio unitario y % de venta</CardTitle>
                  </CardHeader>
                  <EventStatsTable events={statistics!.eventDataIndividual} />
                </Card>
              </section>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div className='hidden justify-center md:flex'>
        <Carousel className='relative w-full max-w-[96rem]'>
          <CarouselContent>
            <CarouselItem>
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
                    title='Entradas emitidas / Cupo'
                    content={statistics?.attendancePercent + '%'}
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Porcentaje de entradas emitidas sobre el total de entradas disponibles entre todos los eventos'
                    }
                  />
                </section>
                <AttendanceChart
                  data={statistics!.emmitedticketPerTypeAll}
                  title='Emitidos por tipo'
                />
              </div>
            </CarouselItem>
            <CarouselItem>
              <section className='mt-4 grid grid-rows-4 rounded-md bg-slate-100 p-3 sm:self-end sm:pb-2'>
                <p className='text-center text-xl font-medium'>
                  Usuarios con mas tickets emitidos
                </p>
                <div className='row-span-3 grid grid-cols-4 gap-4'>
                  {statistics!.emailByPurchasedTickets
                    ?.slice(0, 4)
                    .map((user, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>{user.mail ?? 'No hay usuario'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className='text-2xl font-semibold'>
                            {user.ticketsPurchased ?? '0'} tickets
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </section>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </>
  );
};
