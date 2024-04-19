import { Card, CardTitle } from '@/components/ui/card';
import { RouterOutputs } from '@/server';
import { format } from 'date-fns';
import React, { useMemo } from 'react';

interface ModelosListProps {
  modelos: RouterOutputs['modelo']['getByDateRange'][string];
}

const ModelosList = ({ modelos }: ModelosListProps) => {
  const data = useMemo(() => {
    return modelos.sort((a, b) => {
      return a.created_at > b.created_at ? -1 : 1;
    });
  }, [modelos]);

  return (
    <Card className='flex h-full flex-col p-2 sm:pr-0'>
      <CardTitle className='pb-2 text-2xl font-extrabold sm:text-3xl'>
        Lista de modelos
      </CardTitle>
      <div className='flex flex-1 flex-col overflow-y-auto'>
        {data.length === 0 && (
          <div className='flex h-full w-full items-center justify-center'>
            <p className='text-gray-500'>No hay modelos</p>
          </div>
        )}
        {data.map((modelo) => (
          <div
            key={modelo.id}
            className='flex items-center justify-between gap-x-4'
          >
            <p className='truncate py-1'>{modelo.nombreCompleto}</p>
            <span>{format(modelo.created_at, 'dd/MM/yyyy')}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ModelosList;
