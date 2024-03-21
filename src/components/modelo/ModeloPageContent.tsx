import { RouterOutputs } from '@/server';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import ListaEtiquetas from '@/components/modelo/ListaEtiquetas';
import { create } from 'zustand';
import ComentariosSection from '@/components/modelo/ComentariosSection';
import { Button } from '../ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import CircleXIcon from '../icons/CircleX';
import { Save, Trash2Icon } from 'lucide-react';
import CirclePlus from '../icons/CirclePlus';

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
  const [canEdit, setCanEdit] = useState(false);
  const [edit, setEdit] = useState(false);
  const [fileName, setFileName] = useState('');
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
    setEdit(false);
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
      toast.success('Foto actualizada con éxito');
      setEdit(false);
      setVideo(null);
      setFileName('');
      utils.modelo.getById.invalidate();
      inputRef.current!.value = '';
    });
  }

  return (
    <>
      <div className='mt-4 flex gap-x-4'>
        <div
          onMouseOver={() => setCanEdit(true)}
          onMouseOut={() => setCanEdit(false)}
          onClick={() => setEdit(true)}
          className='relative aspect-square w-28 rounded-lg hover:cursor-pointer md:w-[200px]'
        >
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
            className={`absolute left-0 top-0 h-full w-full rounded-lg object-fill`}
          />
          <div className='absolute left-0 top-0 h-full w-full rounded-lg hover:bg-black/60 hover:transition hover:duration-300 hover:ease-in-out'></div>
          {canEdit && (
            <p className='absolute top-[45%] w-full text-center text-lg font-bold text-white'>
              EDITAR
            </p>
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
      {edit && (
        <>
          <div className='mt-2 flex items-center justify-start'>
            <label className='flex items-center justify-center rounded-full border-2 bg-black text-white hover:cursor-pointer'>
              <CirclePlus className='h-8 w-8' />
              <input
                type='file'
                name='imagen'
                className='hidden'
                accept='image/jpeg,image/png,image/webp'
                ref={inputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFileName(file?.name ?? '');
                  setVideo(file ? file : null);
                  setFotoUrl(!file ? null : URL.createObjectURL(file));
                }}
              />
            </label>
            <span className='ml-3'>{fileName}</span>
          </div>
          <div className='mt-2 flex items-center justify-start gap-x-3'>
            <Button
              className={`h-fit w-fit p-2 text-xs`}
              onClick={handleUpload}
            >
              Guardar <Save className='ml-1 h-5' />
            </Button>
            <Button
              className='h-9 w-fit p-2 text-xs'
              onClick={() => {
                setFotoUrl(modelo.fotoUrl);
                inputRef.current!.value = '';
                setFileName('');
              }}
            >
              Limpiar foto
            </Button>
            <Button
              className='h-fit w-fit bg-red-600 p-2 text-xs hover:bg-red-800'
              onClick={handleDelete}
            >
              Eliminar
              <Trash2Icon className='ml-1 h-5' />
            </Button>
            <CircleXIcon
              onClick={() => {
                setFotoUrl(modelo.fotoUrl);
                inputRef.current!.value = '';
                setFileName('');
                setEdit(false);
              }}
              className='h-8 w-8 cursor-pointer'
            />
          </div>
        </>
      )}
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
