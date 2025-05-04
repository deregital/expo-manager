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
import { AttendanceChart } from './AttendanceChart';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

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
        <Carousel className='relative w-full max-w-[96rem]'>
          <CarouselContent>
            <CarouselItem>
              <div className='grid grid-rows-2 gap-4 p-3'>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title='Ingresos Totales'
                    content={'$' + statistics!.totalIncome}
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Ingresos totales en pesos de todos los eventos incluyendo espectadores y participantes'
                    }
                  />
                </section>
                <section className='h-full rounded-md sm:pb-2'>
                  <SharedCard
                    title='Entradas emitidas / Cupo'
                    content={statistics!.attendancePercent + '%'}
                    isLoading={isLoadingStatistics}
                    popoverText={
                      'Porcentaje de entradas emitidas sobre el total de entradas disponibles entre todos los eventos'
                    }
                  />
                </section>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className='p-3'>
                <AttendanceChart
                  data={statistics!.emmitedticketPerTypeAll}
                  title='Tickets emitidos por tipo'
                />
              </div>
            </CarouselItem>
            <CarouselItem>
              <section className='mt-4 rounded-md bg-slate-100 p-3 sm:self-end sm:pb-2'>
                <p className='pb-4 text-center text-xl font-medium'>
                  Usuarios con mas tickets emitidos
                </p>

                <div className='hidden grid-cols-2 gap-4 sm:grid'>
                  {statistics!.emailByPurchasedTickets
                    ?.slice(0, 4)
                    .map((user, index) => (
                      <Card key={user.mail}>
                        <CardHeader className='p-2 px-4 lg:p-6'>
                          <CardTitle className='w-[calc(100%-2rem)] truncate text-xl'>
                            {user.mail ?? 'No hay usuario'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className='text-xl font-medium'>
                            {user.ticketsPurchased ?? '0'} tickets
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
                <div className='gap-4 sm:hidden'>
                  <Table>
                    <TableBody className='border-b-0'>
                      {statistics!.emailByPurchasedTickets
                        ?.slice(0, 4)
                        .map((user, index) => (
                          <TableRow
                            key={user.mail}
                            className='rounded-lg bg-white'
                          >
                            <TableCell className='font-medium'>
                              {index + 1}
                            </TableCell>
                            <TableCell className='font-medium'>
                              {user.mail}
                            </TableCell>
                            <TableCell className='text-right'>
                              {user.ticketsPurchased} tickets
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
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
                  title='Tickets emitidos por tipo'
                />
              </div>
            </CarouselItem>
            <CarouselItem>
              <section className='mt-4 rounded-md bg-slate-100 p-3 sm:self-end sm:pb-2'>
                <p className='pb-4 text-center text-xl font-medium'>
                  Usuarios con mas tickets emitidos
                </p>
                <div className='hidden grid-cols-4 gap-4 lg:grid'>
                  {statistics!.emailByPurchasedTickets
                    ?.slice(0, 4)
                    .map((user, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className='truncate text-xl'>
                            {user.mail ?? 'No hay usuario'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className='text-2xl font-semibold'>
                            {user.ticketsPurchased ?? '0'} tickets
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
                <div className='grid grid-cols-2 gap-4 lg:hidden'>
                  {statistics!.emailByPurchasedTickets
                    ?.slice(0, 4)
                    .map((user, index) => (
                      <Card key={user.mail}>
                        <CardHeader className='p-2 px-4 lg:p-6'>
                          <CardTitle className='w-[calc(100%-2rem)] truncate text-xl'>
                            {user.mail ?? 'No hay usuario'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className='text-xl font-medium'>
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
