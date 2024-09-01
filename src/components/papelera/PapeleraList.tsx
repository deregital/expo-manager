import FotoModelo from '@/components/ui/FotoModelo';
import Loader from '@/components/ui/loader';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import { RouterOutputs } from '@/server';

interface PapeleraListProps {
  modelos: RouterOutputs['modelo']['getModelosPapelera'];
  isLoading: boolean;
}

const PapeleraList = ({ modelos, isLoading }: PapeleraListProps) => {
  return (
    <div className='flex max-w-full flex-1 flex-col gap-y-2 overflow-y-auto overflow-x-hidden'>
      {isLoading ? (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader />
        </div>
      ) : (
        modelos.length === 0 && (
          <div className='flex h-full w-full items-center justify-center'>
            <p className='text-gray-500'>No hay participantes en la papelera</p>
          </div>
        )
      )}
      {modelos.map((modelo) => (
        <Link
          href={`/modelo/${modelo.id}`}
          key={modelo.id}
          className='flex items-center justify-between gap-x-4 px-3 py-2 hover:bg-gray-200'
        >
          <div className='flex w-full items-center gap-x-1 truncate'>
            <FotoModelo url={modelo.fotoUrl ?? ''} />
            <p className='w-full truncate py-1'>{modelo.nombreCompleto}</p>
          </div>
          <div className='flex w-fit flex-col items-end'>
            {/* <span>{format(new Date(modelo.created_at), 'dd/MM/yyyy')}</span> */}
            <span className='text-sm text-gray-500'>{modelo.telefono}</span>
            {modelo.fechaPapelera && (
              <span className='whitespace-nowrap text-sm text-gray-500'>
                En papelera desde:{' '}
                {format(new Date(modelo.fechaPapelera), 'dd/MM/yyyy')}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PapeleraList;
