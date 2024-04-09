import { Card, CardTitle } from '@/components/ui/card';
import { RouterOutputs } from '@/server';
import React from 'react';

interface ModelosListProps {
  modelos: RouterOutputs['modelo']['getByDateRange'][string];
}

const ModelosList = ({ modelos }: ModelosListProps) => {
  return (
    <Card className='flex h-full flex-col p-2'>
      <CardTitle className='pb-2 text-2xl font-extrabold sm:text-3xl'>
        Lista de modelos
      </CardTitle>
      <div className='flex flex-1 flex-col overflow-y-auto'>
        {modelos.length === 0 && (
          <div className='flex h-full w-full items-center justify-center'>
            <p className='text-gray-500'>No hay modelos</p>
          </div>
        )}
        {modelos.map((modelo) => (
          <div key={modelo.id} className='flex justify-between'>
            <p className='truncate'>{modelo.nombreCompleto}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ModelosList;
