import FotoModelo from '@/components/ui/FotoModelo';
import { Card, CardTitle } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import { RouterOutputs } from '@/server';
import { format } from 'date-fns';
import React, { useMemo } from 'react';

interface ModelosListProps {
  modelos: RouterOutputs['modelo']['getByDateRange'][string];
  isLoading: boolean;
}

const ModelosList = ({ modelos, isLoading }: ModelosListProps) => {
  const data = useMemo(() => {
    return modelos.sort((a, b) => {
      return a.created_at > b.created_at ? -1 : 1;
    });
  }, [modelos]);

  return (
    <Card className='flex h-full flex-col p-2 pr-0 sm:pr-2'>
      <CardTitle className='pb-2 text-2xl font-extrabold sm:text-3xl'>
        Lista de modelos
      </CardTitle>
      <div className='flex max-w-full flex-1 flex-col gap-y-2 overflow-y-auto overflow-x-hidden'>
        {isLoading ? (
          <div className='flex h-full w-full items-center justify-center'>
            <Loader />
          </div>
        ) : (
          data.length === 0 && (
            <div className='flex h-full w-full items-center justify-center'>
              <p className='text-gray-500'>No hay modelos</p>
            </div>
          )
        )}
        {data.map((modelo) => (
          <div
            key={modelo.id}
            className='flex items-center justify-between gap-x-4'
          >
            <div className='flex w-full items-center gap-x-1 truncate'>
              <FotoModelo url={modelo.fotoUrl} />
              <p className='w-full truncate py-1'>{modelo.nombreCompleto}</p>
            </div>
            <span className='w-fit'>
              {format(modelo.created_at, 'dd/MM/yyyy')}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ModelosList;
