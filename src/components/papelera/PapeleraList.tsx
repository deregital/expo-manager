import Loader from '@/components/ui/loader';
import React from 'react';
import { RouterOutputs } from '@/server';
import PapeleraRow from '@/components/papelera/PapeleraRow';

interface PapeleraListProps {
  modelos: RouterOutputs['modelo']['getModelosPapelera'];
  isLoading: boolean;
}

const PapeleraList = ({ modelos, isLoading }: PapeleraListProps) => {
  const modelosOrdenados = modelos.sort((a, b) => {
    const fechaA = a.fechaPapelera ? new Date(a.fechaPapelera).getTime() : 0;
    const fechaB = b.fechaPapelera ? new Date(b.fechaPapelera).getTime() : 0;
    return fechaB - fechaA;
  });

  return (
    <div className='flex max-w-full flex-1 flex-col gap-y-2'>
      {isLoading ? (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader />
        </div>
      ) : (
        modelosOrdenados.length === 0 && (
          <div className='flex h-full w-full items-center justify-center'>
            <p className='text-gray-500'>No hay participantes en la papelera</p>
          </div>
        )
      )}
      {modelosOrdenados.map((modelo) => (
        <PapeleraRow key={modelo.id} modelo={modelo} />
      ))}
    </div>
  );
};

export default PapeleraList;
