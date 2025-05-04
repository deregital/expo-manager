import SharedCard from '@/components/dashboard/SharedCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { AttendancePerHourChart } from './AttendancePerHourChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeatmapCalendarTickets } from './HeatmapCalendar';
import { AttendanceChart } from './AttendanceChart';

export const StatisticsCarouselSpecific = ({
  eventId,
  startingDate,
  endingDate,
}: {
  eventId: string;
  startingDate: string;
  endingDate: string;
}) => {
  const { data: statistics, isLoading: isLoadingStatistics } =
    trpc.event.getStatisticsById.useQuery({
      id: eventId,
      gte: '',
      lte: '',
    });

  return isLoadingStatistics ? (
    <div className='flex h-72 items-center justify-center'>
      <Loader />
    </div>
  ) : (
    <>
      <div className='flex h-80 justify-center md:hidden'>
        <Carousel className='relative h-64 w-full max-w-[96rem]'>
          <CarouselContent>
            <CarouselItem>
              <div className='grid grid-rows-2 gap-4'>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Ingresos / Maximo posible'}
                    content={
                      '$' +
                      statistics!.totalIncome +
                      ' / $' +
                      statistics!.maxTotalIncome
                    }
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Ingresos en pesos recaudados por (/) cantidad maxima posible a recaudar'
                    }
                  />
                </section>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Entradas emitidas / Cupo'}
                    content={statistics!.emittedTicketsPercent + '%'}
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Porcentaje de entradas emitidas por (/) cupo maximo a emitir'
                    }
                  />
                </section>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className='grid grid-rows-2 gap-4'>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Tasa de asistencia'}
                    content={(statistics!.attendancePercent ?? 0) + '%'}
                    isLoading={isLoadingStatistics}
                    popoverText={'Porcentaje de asistencia de espectadores'}
                  />
                </section>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Tickets promedio por compra'}
                    content={
                      statistics!.avgAmountPerTicketGroup?.toString() ??
                      '0' + ' tickets'
                    }
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Cantidad promedio de tickets comprados/emitidos en cada compra'
                    }
                  />
                </section>
              </div>
            </CarouselItem>
            <CarouselItem>
              <AttendanceChart
                title='Tickets emitidos por tipo'
                data={statistics!.emmitedticketPerType}
              />
            </CarouselItem>
            <CarouselItem>
              <AttendancePerHourChart
                dates={statistics!.attendancePerHour}
                starting={startingDate}
                ending={endingDate}
              />
            </CarouselItem>
            <CarouselItem>
              <Card>
                <CardContent className='p-0 pb-0'>
                  <p className='py-2 text-center text-xl font-semibold'>
                    Tickets emitido en mapa de calor
                  </p>
                  <HeatmapCalendarTickets data={statistics!.heatMapDates} />
                </CardContent>
              </Card>
            </CarouselItem>
            <CarouselItem>
              <div className='grid w-full grid-rows-2 gap-4'>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Ausentes'}
                    content={
                      (statistics!.notScanned?.toString() ?? '0') + ' personas'
                    }
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Cantidad de tickets no escaneados, o mas bien, cantidad de personas que se ausentaron al evento'
                    }
                  />
                </section>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Tickets escaneados / Total emitidos'}
                    content={
                      statistics!.totalTicketsScanned +
                      '/' +
                      statistics!.emmitedTickets +
                      ' tickets'
                    }
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Cantidad de tickets escaneados sobre el total de tickets emitidos'
                    }
                  />
                </section>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div className='hidden h-80 justify-center md:flex'>
        <Carousel className='relative h-64 w-full max-w-[96rem]'>
          <CarouselContent>
            <CarouselItem>
              <div className='grid w-full grid-cols-3 grid-rows-1 gap-4'>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Ingresos / Maximo posible'}
                    content={
                      '$' +
                      statistics!.totalIncome +
                      ' / $' +
                      statistics!.maxTotalIncome
                    }
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Ingresos en pesos recaudados por (/) cantidad maxima posible a recaudar'
                    }
                  />
                </section>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Entradas emitidas / Cupo'}
                    content={statistics!.emittedTicketsPercent + '%'}
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Porcentaje de entradas emitidas por (/) cupo maximo a emitir'
                    }
                  />
                </section>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Tasa de asistencia'}
                    content={(statistics!.attendancePercent ?? 0) + '%'}
                    isLoading={isLoadingStatistics}
                    popoverText={'Porcentaje de asistencia de espectadores'}
                  />
                </section>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className='grid w-full grid-cols-5 grid-rows-1 gap-4'>
                <div className='col-span-3'>
                  <AttendanceChart
                    title='Tickets emitidos por tipo'
                    data={statistics!.emmitedticketPerType}
                  />
                </div>
                <section className='col-span-2 h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Tickets promedio por compra'}
                    content={
                      statistics!.avgAmountPerTicketGroup?.toString() ??
                      '0' + ' tickets'
                    }
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Cantidad promedio de tickets comprados/emitidos en cada compra'
                    }
                  />
                </section>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className='grid  w-full grid-cols-4 grid-rows-1 gap-4'>
                <div className='col-span-2'>
                  <AttendancePerHourChart
                    dates={statistics!.attendancePerHour}
                    starting={startingDate}
                    ending={endingDate}
                  />
                </div>
                <section className='col-span-2 h-full rounded-md sm:pb-2'>
                  <Card className='flex '>
                    <CardHeader className='w-1/4 items-center justify-center lg:w-full'>
                      <CardTitle className='flex h-full items-center justify-center text-center'>
                        Tickets emitido en mapa de calor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='p-0 pb-0'>
                      <HeatmapCalendarTickets data={statistics!.heatMapDates} />
                    </CardContent>
                  </Card>
                </section>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className='grid w-full grid-cols-2 grid-rows-1 gap-4'>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Ausentes'}
                    content={
                      (statistics!.notScanned?.toString() ?? '0') + ' personas'
                    }
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Cantidad de tickets no escaneados, o mas bien, cantidad de personas que se ausentaron al evento'
                    }
                  />
                </section>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title={'Tickets escaneados / Total emitidos'}
                    content={
                      statistics!.totalTicketsScanned +
                      '/' +
                      statistics!.emmitedTickets +
                      ' tickets'
                    }
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Cantidad de tickets escaneados sobre el total de tickets emitidos'
                    }
                  />
                </section>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </>
  );
};
