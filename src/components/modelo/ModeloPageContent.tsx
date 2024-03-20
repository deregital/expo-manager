import { RouterOutputs } from '@/server';
import React, { useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [showButton, setShowButton] = useState(false);
  const utils = trpc.useUtils();

  async function handleDelete() {
    const form = new FormData();
    form.append('id', modelo.id);
    form.append('url', modelo.fotoUrl ?? '');
    await fetch('/api/image', {
      method: 'DELETE',
      body: form,
    })
      .then((res) => {
        toast.success('Foto eliminada con éxito');
        utils.modelo.getById.invalidate();
        setFotoUrl(null);
      })
      .catch(() => toast.error('Error al eliminar la foto'));
    inputRef.current!.value = '';
  }

  async function handleUpload() {
    if (!video) {
      toast.error('No se ha seleccionado una imágen');
      return;
    }
    const form = new FormData();
    form.append('imagen', video);
    form.append('id', modelo.id);
    form.append('url', modelo.fotoUrl ?? '');
    await fetch('/api/image', {
      method: 'POST',
      body: form,
    }).then((res) => {
      console.log(res);
      inputRef.current!.value = '';
      toast.success('Foto actualizada con éxito');
      setShowButton(false);
      utils.modelo.getById.invalidate();
    });
  }

  return (
    <>
      <div className='mt-4 flex gap-x-4'>
        <Image
          src={
            (fotoUrl === modelo.fotoUrl && fotoUrl
              ? `${fotoUrl}?test=${new Date().getTime()}`
              : fotoUrl) || '/img/profilePlaceholder.jpg'
          }
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
              name='imagen'
              className='text-base'
              accept='image/jpeg,image/png,image/webp'
              ref={inputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setVideo(file ? file : null);
                setFotoUrl(!file ? null : URL.createObjectURL(file));
                setShowButton(!!file);
              }}
            />
          </div>
          <div className='hidden gap-x-3 md:flex'>
            {showButton && (
              <Button
                className={`h-fit w-fit p-2 text-xs`}
                onClick={handleUpload}
              >
                Guardar
              </Button>
            )}
            <Button className='h-fit w-fit p-2 text-xs' onClick={handleDelete}>
              Eliminar foto
            </Button>
            {showButton && (
              <Button
                className='h-fit w-fit p-2 text-xs'
                onClick={() => {
                  setFotoUrl(modelo.fotoUrl);
                  inputRef.current!.value = '';
                  setShowButton(false);
                }}
              >
                Limpiar foto
              </Button>
            )}
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
