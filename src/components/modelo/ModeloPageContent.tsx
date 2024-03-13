import { RouterOutputs } from '@/server';
import React from 'react';
import Image from 'next/image';
import ListaEtiquetas from '@/components/modelo/ListaEtiquetas';
import { create } from 'zustand';

interface ModeloPageContentProps {
  modelo: NonNullable<RouterOutputs['modelo']['getById']>;
}

type ModeloData = {
  id: string;
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'];
};

export const useModeloData = create<ModeloData>(() => ({
  id: '',
  etiquetas: [],
}));

const ModeloPageContent = ({ modelo }: ModeloPageContentProps) => {
  const { etiquetas } = useModeloData((state) => ({
    etiquetas: state.etiquetas,
    id: state.id,
  }));

  return (
    <>
      <div className='mt-4 flex gap-x-4'>
        <Image
          src={modelo?.fotoUrl || '/img/profilePlaceholder.jpg'}
          width={150}
          height={150}
          alt={`${modelo?.nombreCompleto}`}
          priority
          className='aspect-square w-20 rounded-lg md:w-[150px]'
        />
        <div className='flex flex-col justify-between'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end'>
            <h2 className='text-xl font-bold md:text-3xl'>
              {modelo?.nombreCompleto}
            </h2>
            <div className='flex gap-x-4'>
              <p>Edad: {modelo?.edad ?? 'N/A'}</p>
              <p>Género: {modelo?.genero ?? 'N/A'}</p>
            </div>
          </div>
          <div className='hidden flex-wrap gap-2 md:flex'>
            <ListaEtiquetas modeloId={modelo.id} etiquetas={etiquetas} />
          </div>
        </div>
      </div>
      <div className='mt-4 flex flex-wrap gap-2 md:hidden'>
        <ListaEtiquetas modeloId={modelo.id} etiquetas={etiquetas} />
      </div>
    </>
  );
};

export default ModeloPageContent;
