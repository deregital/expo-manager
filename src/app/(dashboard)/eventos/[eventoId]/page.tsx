'use client';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { ArrowLeftIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/ui/SearchInput';
import { useEffect, useState } from 'react';
import { searchNormalize } from '@/lib/utils';
import { DataTable } from '@/components/modelos/table/dataTable';
import { generateColumns } from '@/components/eventos/table/columnsEvento';
import RaiseHand from '@/components/icons/RaiseHand';

interface EventoPageProps {
  params: {
    eventoId: string;
  };
}

const EventoPage = ({ params }: EventoPageProps) => {
  const { data: evento, isLoading: isLoadingEvento } =
    trpc.evento.getById.useQuery({
      id: params.eventoId,
    });
  const { data: modelos } = trpc.modelo.getAll.useQuery();

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [modelosData, setModelosData] = useState<
    RouterOutputs['modelo']['getAll']
  >(modelos ?? []);

  useEffect(() => {
    if (!modelos) return;
    setModelosData(
      modelos.filter((modelo) => {
        if (modelo.idLegible !== null) {
          return (
            searchNormalize(modelo.idLegible.toString(), search) ||
            searchNormalize(modelo.nombreCompleto, search)
          );
        }
        return searchNormalize(modelo.nombreCompleto, search);
      })
    );
  }, [search, modelos]);

  if (isLoadingEvento)
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
      <div className='grid auto-rows-auto grid-cols-2 items-center justify-center gap-x-3 pb-3 sm:flex'>
        <h3 className='col-span-2 p-2 text-center text-2xl font-bold'>
          {evento?.nombre}
        </h3>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {format(evento!.fecha, 'yyyy-MM-dd')}
        </h3>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {evento?.ubicacion}
        </h3>
      </div>
      <div className='flex items-center justify-center gap-x-2 px-2 pb-5'>
        <SearchInput
          onChange={setSearch}
          placeholder='Buscar por nombre o ID legible'
        />
        <Button
          className='rounded-lg bg-gray-400 px-3 py-1.5 text-xl font-bold text-black hover:bg-gray-500'
          onClick={() => router.push(`/eventos/${evento?.id}/presentismo`)}
        >
          <RaiseHand />
        </Button>
      </div>
      <DataTable
        columns={generateColumns(evento!.etiquetaConfirmoId)}
        data={modelosData}
        initialSortingColumn={{ id: 'created_at', desc: true }}
      />
    </div>
  );
};

export default EventoPage;
