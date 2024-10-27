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
  const {
    data: comments,
    isLoading: isLoadingComments,
    isRefetching: isRefetchingComments,
  } = trpc.comment.getById.useQuery(params.modeloId);

  const router = useRouter();

  useEffect(() => {
    if (isRefetchingComments) return;
    if (isLoadingModelo || isLoadingComments) return;

    if (!modelo || !comments) return;

    useModeloData.setState({
      id: modelo.id,
      etiquetas: modelo.etiquetas,
      comments: comments.comments,
    });
  }, [
    modelo,
    isLoadingModelo,
    isLoadingComments,
    comments,
    isRefetchingComments,
  ]);

  return (
    <div className='h-full px-4 pt-4'>
      <div className='flex items-center gap-x-4'>
        <ArrowLeft
          className='cursor-pointer'
          onClick={() => {
            router.back();
          }}
        />
      </div>
      {isLoadingModelo || isLoadingComments || !modelo || !comments ? (
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
