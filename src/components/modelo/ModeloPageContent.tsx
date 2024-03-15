import { RouterOutputs } from '@/server';
import React, { useState } from 'react';
import Image from 'next/image';
import ListaEtiquetas from '@/components/modelo/ListaEtiquetas';
import { create } from 'zustand';
import ComentariosSection from '@/components/modelo/ComentariosSection';
import { Button } from '../ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ModeloPageContentProps {
  modelo: NonNullable<RouterOutputs['modelo']['getById']>;
}

type ModeloData = {
  id: string;
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'];
};

type ModeloFoto = {
  id: string;
  fotoUrl: string | undefined;
};

export const useModeloData = create<ModeloData>(() => ({
  id: '',
  etiquetas: [],
}));
export const useModeloFoto = create<ModeloFoto>(() => ({
  id: '',
  fotoUrl: undefined,
}));

const ModeloPageContent = ({ modelo }: ModeloPageContentProps) => {
  const { etiquetas } = useModeloData((state) => ({
    etiquetas: state.etiquetas,
    id: state.id,
  }));
  const [fotoUrl, setFotoUrl] = useState(modelo?.fotoUrl);
  const editModelo = trpc.modelo.edit.useMutation();

  async function handleDelete() {
    await editModelo
      .mutateAsync({
        id: modelo.id,
        fotoUrl: fotoUrl === null ? undefined : fotoUrl,
      })
      .then(() => toast.success('Foto eliminada con éxito'))
      .catch(() => toast.error('Error al eliminar la foto'));
  }

  async function handleUpload() {
    await editModelo
      .mutateAsync({
        id: modelo.id,
        fotoUrl: fotoUrl === null ? undefined : fotoUrl,
      })
      .then(() => toast.success('Foto actualizada'))
      .catch(() => toast.error('Error al actualizar la foto'));
  }

  return (
    <>
      <div className='mt-4 flex gap-x-4'>
        <Image
          src={fotoUrl || '/img/profilePlaceholder.jpg'}
          width={150}
          height={150}
          alt={`${modelo?.nombreCompleto}`}
          priority
          className='aspect-square w-20 rounded-lg object-fill md:w-[150px]'
        />
        <div className='flex w-full flex-col gap-y-4'>
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
          <div className='hidden md:flex'>
            <input
              type='file'
              className='text-base'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFotoUrl(URL.createObjectURL(file));
              }}
            />
          </div>
          <div className='hidden gap-x-3 md:flex'>
            <Button
              className={`${fotoUrl && fotoUrl !== modelo.fotoUrl ? 'flex' : 'hidden'} h-fit w-fit p-2 text-xs`}
              onClick={handleUpload}
            >
              Guardar
            </Button>
            <Button className='h-fit w-fit p-2 text-xs' onClick={handleDelete}>
              Eliminar foto
            </Button>
            <Button
              className='h-fit w-fit p-2 text-xs'
              onClick={() => setFotoUrl(modelo.fotoUrl)}
            >
              Limpiar foto
            </Button>
          </div>
        </div>
      </div>
      <div className='mt-4 flex flex-wrap gap-2 md:hidden'>
        <ListaEtiquetas modeloId={modelo.id} etiquetas={etiquetas} />
      </div>

      <div className='mt-10'>
        <h2 className='text-xl font-bold md:text-2xl'>Comentarios</h2>
        <ComentariosSection modeloId={modelo.id} />
      </div>
    </>
  );
};

export default ModeloPageContent;
