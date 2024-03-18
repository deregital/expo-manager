'use client';
import ModeloPageContent, {
  useModeloData,
} from '@/components/modelo/ModeloPageContent';
import Loader from '@/components/ui/loader';
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
  const { data: modelo, isLoading: isLoadingModelo } =
    trpc.modelo.getById.useQuery(params.modeloId);
  const { data: comentarios, isLoading: isLoadingComentarios } =
    trpc.comentario.getByPerfilId.useQuery({ perfilId: params.modeloId });

  const router = useRouter();

  useEffect(() => {
    if (isLoadingModelo || isLoadingComentarios) return;

    if (!modelo || !comentarios) return;

    useModeloData.setState({
      id: modelo.id,
      etiquetas: modelo.etiquetas,
      comentarios: comentarios,
    });
  }, [modelo, isLoadingModelo, isLoadingComentarios, comentarios]);

  return (
    <div className='h-full px-4 pt-4'>
      <div className='flex items-center gap-x-4'>
        <ArrowLeft
          className='cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-x-2'
          onClick={() => router.back()}
        />
      </div>
      {isLoadingModelo || isLoadingComentarios || !modelo || !comentarios ? (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader />
        </div>
      ) : (
        <ModeloPageContent modelo={modelo} />
      )}
    </div>
  );
};

export default ModeloPage;
