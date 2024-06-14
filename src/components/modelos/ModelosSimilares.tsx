import ModeloFillIcon from '@/components/icons/ModeloFillIcon';
import { ModelosSimilarity } from '@/server/types/modelos';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ModelosSimilaresProps {
  similarityModelos: ModelosSimilarity;
}

const ModelosSimilares = ({ similarityModelos }: ModelosSimilaresProps) => {
  const router = useRouter();
  return similarityModelos.map((modelo) => (
    <div key={modelo.modelo.id} className='flex items-center justify-between'>
      <p>
        <span className='font-bold'>Nombre:</span>{' '}
        {modelo.modelo.nombreCompleto}
      </p>
      <p>
        <span className='font-bold'>Teléfono:</span>{' '}
        {modelo.modelo.nombreCompleto}
      </p>
      <ModeloFillIcon
        className='h-6 w-6 hover:text-gray-400'
        onClick={() => {
          router.push(`/modelo/${modelo.modelo.id}`);
        }}
      />
    </div>
  ));
};

export default ModelosSimilares;
