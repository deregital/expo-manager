import { RouterOutputs } from '@/server';
import React, { useRef, useState } from 'react';
import ListaEtiquetas from '@/components/modelo/ListaEtiquetas';
import { create } from 'zustand';
import ComentariosSection from '@/components/modelo/ComentariosSection';
import { Button } from '../ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import CircleXIcon from '../icons/CircleX';
import { Save, Trash2Icon } from 'lucide-react';
import CirclePlus from '../icons/CirclePlus';
import ModeloFoto from '@/components/modelo/ModeloFoto';

interface ModeloPageContentProps {
  modelo: NonNullable<RouterOutputs['modelo']['getById']>;
}

type ModeloData = {
  id: string;
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'];
  comentarios: RouterOutputs['comentario']['getByPerfilId'] | undefined;
};

type ModeloFoto = {
  id: string;
  fotoUrl: string | undefined;
};

export const useModeloData = create<ModeloData>(() => ({
  id: '',
  etiquetas: [],
  comentarios: undefined,
}));
export const useModeloFoto = create<ModeloFoto>(() => ({
  id: '',
  fotoUrl: undefined,
}));

const ModeloPageContent = ({ modelo }: ModeloPageContentProps) => {
  const { etiquetas } = useModeloData((state) => ({
    etiquetas: state.etiquetas,
  }));
  const [fotoUrl, setFotoUrl] = useState(modelo?.fotoUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [edit, setEdit] = useState(false);
  const utils = trpc.useUtils();

  async function handleDelete() {
    const form = new FormData();
    form.append('id', modelo.id);
    form.append('url', modelo.fotoUrl ?? '');
    await fetch('/api/image', {
      method: 'DELETE',
      body: form,
    })
      .then(() => {
        toast.success('Foto eliminada con éxito');
        utils.modelo.getById.invalidate();
        setFotoUrl(null);
      })
      .catch(() => toast.error('Error al eliminar la foto'));
    setEdit(false);
    inputRef.current!.value = '';
  }

  async function handleUpload() {
    if (!video) {
      toast.error('No se ha seleccionado una imagen');
      return;
    }
    const form = new FormData();
    form.append('imagen', video);
    form.append('id', modelo.id);
    form.append('url', modelo.fotoUrl ?? '');

    toast.loading('Subiendo foto...');
    setEdit(false);

    await fetch('/api/image', {
      method: 'POST',
      body: form,
    })
      .then(() => {
        toast.dismiss();

        if (inputRef.current) {
          inputRef.current!.value = '';
        }
        setEdit(false);
        setVideo(null);
        utils.modelo.getById.invalidate();
        toast.success('Foto actualizada con éxito');
      })
      .catch((e) => {
        console.log(e);

        toast.dismiss();
        toast.error('Error al subir la foto');
        setEdit(false);
        setVideo(null);
        setFotoUrl(modelo.fotoUrl);
      });
  }

  function handleCancel() {
    setFotoUrl(modelo.fotoUrl);
    setVideo(null);
    inputRef.current!.value = '';
    setEdit(false);
  }

  return (
    <>
      <div className='mt-4 flex gap-x-4'>
        <div className='relative w-28 md:w-[200px]'>
          <ModeloFoto
            onClick={() => {
              setEdit(true);
            }}
            alt={`${modelo?.nombreCompleto}`}
            src={
              (fotoUrl === modelo.fotoUrl && fotoUrl
                ? `${fotoUrl}?test=${new Date().getTime()}`
                : fotoUrl) || '/img/profilePlaceholder.jpg'
            }
          />
          {edit && (
            <>
              <div className='mt-2 flex items-center justify-between gap-x-3'>
                <label className='flex aspect-square w-[calc(33%-4px)] items-center justify-center rounded-full border-2 bg-black text-white hover:cursor-pointer md:h-8 md:w-8'>
                  <CirclePlus className='h-6 w-6 md:h-8 md:w-8' />
                  <input
                    type='file'
                    name='imagen'
                    className='hidden'
                    accept='image/jpeg,image/png,image/webp'
                    ref={inputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setVideo(file ?? null);
                      setFotoUrl(!file ? null : URL.createObjectURL(file));
                    }}
                  />
                </label>
                {inputRef.current?.value && (
                  <>
                    <Button
                      className={`aspect-square h-8 w-[calc(33%-4px)] p-1 text-xs md:w-8`}
                      onClick={handleUpload}
                    >
                      <Save className='h-5 w-5' />
                    </Button>
                  </>
                )}
                {!inputRef.current?.value && (
                  <Button
                    className='aspect-square h-8 w-[calc(33%-4px)] bg-red-600 p-1 hover:bg-red-800 md:h-max md:w-8'
                    onClick={handleDelete}
                  >
                    <Trash2Icon className='h-5 w-5' />
                  </Button>
                )}
                <CircleXIcon
                  onClick={handleCancel}
                  className='aspect-square w-[calc(33%-4px)] cursor-pointer md:h-8 md:w-8'
                />
              </div>
              {video && (
                <span className='mt-1 max-w-full truncate'>{video.name}</span>
              )}
            </>
          )}
        </div>
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
        </div>
      </div>

      <div className='mt-4 flex flex-wrap gap-2 md:hidden'>
        <ListaEtiquetas modeloId={modelo.id} etiquetas={etiquetas} />
      </div>

      <div className='mt-5'>
        <h2 className='text-xl font-bold md:text-2xl'>Comentarios</h2>
        <ComentariosSection modeloId={modelo.id} />
      </div>
    </>
  );
};

export default ModeloPageContent;
