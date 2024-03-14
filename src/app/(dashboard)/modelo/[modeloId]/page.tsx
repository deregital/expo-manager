'use client';
import ModeloPageContent, {
  useModeloData,
} from '@/components/modelo/ModeloPageContent';
import { trpc } from '@/lib/trpc';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface ModeloPageProps {
  params: {
    modeloId: string;
  };
}

const ModeloPage = ({ params }: ModeloPageProps) => {
  const { data: modelo, isLoading } = trpc.modelo.getById.useQuery(
    params.modeloId
  );
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!modelo) return;

    useModeloData.setState({
      id: modelo.id,
      etiquetas: modelo.etiquetas,
    });
  }, [modelo, isLoading]);

  return (
    <div className='px-4 pt-4'>
      <div className='flex items-center gap-x-4'>
        <ArrowLeft
          className='cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-x-2'
          onClick={() => router.back()}
        />
      </div>
      {isLoading || !modelo ? (
        <div className='w-full'>
          <p className='text-center'>Cargando...</p>
        </div>
      ) : (
        <ModeloPageContent modelo={modelo} />
      )}
    </div>
  );
};

export default ModeloPage;
