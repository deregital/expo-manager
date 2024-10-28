import { RouterOutputs } from '@/server';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ListaEtiquetasModelo from '@/components/modelo/ListaEtiquetasModelo';
import { create } from 'zustand';
import CommentsSection from '@/components/modelo/CommentsSection';
import { Button } from '../ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import CircleXIcon from '../icons/CircleX';
import { Save, Trash2Icon } from 'lucide-react';
import CirclePlus from '../icons/CirclePlus';
import ModeloFoto from '@/components/modelo/ModeloFoto';
import ModeloEditModal, {
  edadFromFechaNacimiento,
} from '@/components/modelo/ModeloEditModal';
import { TipoEtiqueta } from '@prisma/client';
import Link from 'next/link';
import ChatFillIcon from '@/components/icons/ChatFillIcon';
import WhatsappIcon from '@/components/icons/WhatsappIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';
import MailIcon from '@/components/icons/MailIcon';
import DNIIcon from '@/components/icons/DNIIcon';
import { EtiquetaBaseConGrupoColor } from '@/server/types/etiquetas';
import BotonesPapelera from '@/components/papelera/BotonesPapelera';
import { GetByProfileCommentResponseDto } from 'expo-backend-types';

interface ModeloPageContentProps {
  modelo: NonNullable<RouterOutputs['modelo']['getById']>;
}
type ModeloData = {
  id: string;
  etiquetas: EtiquetaBaseConGrupoColor[];
  comments: GetByProfileCommentResponseDto['comments'] | undefined;
};
type ModeloFoto = {
  id: string;
  fotoUrl: string | undefined;
};
export const useModeloData = create<ModeloData>(() => ({
  id: '',
  etiquetas: [],
  comments: undefined,
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
  const etiquetasFiltradas = useMemo(
    () =>
      etiquetas.filter(
        (e) =>
          e.tipo !== TipoEtiqueta.MODELO && e.tipo !== TipoEtiqueta.TENTATIVA
      ),
    [etiquetas]
  );

  useEffect(() => {
    setFotoUrl(modelo.fotoUrl);
  }, [modelo]);

  async function handleDelete() {
    const form = new FormData();
    form.append('id', modelo.id);
    form.append('url', fotoUrl ?? '');
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
      <div className='mt-4 flex flex-col gap-x-4 sm:flex-row'>
        <div className='relative flex w-full flex-col items-center md:w-[200px]'>
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
              <div className='mt-2 flex w-full max-w-[200px] items-center justify-between gap-x-3'>
                <label className='flex aspect-square w-[calc(33%-4px)] max-w-12 items-center justify-center rounded-full border-2 bg-black text-white hover:cursor-pointer md:h-8 md:w-8'>
                  <CirclePlus className='h-8 w-8 md:h-8 md:w-8' />
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
                      className={`aspect-square h-10 w-[calc(33%-4px)] max-w-10 p-1 text-xs md:h-8 md:w-8`}
                      onClick={handleUpload}
                    >
                      <Save className='h-5 w-5' />
                    </Button>
                  </>
                )}
                {!inputRef.current?.value && fotoUrl && (
                  <Button
                    className='aspect-square h-10 w-[calc(33%-4px)] max-w-10 bg-red-600 p-1 hover:bg-red-800 md:h-max md:w-8'
                    onClick={handleDelete}
                  >
                    <Trash2Icon className='h-5 w-5' />
                  </Button>
                )}
                <CircleXIcon
                  onClick={handleCancel}
                  className='aspect-square w-[calc(33%-4px)] max-w-12 cursor-pointer md:h-8 md:w-8'
                />
              </div>
              {video && (
                <span className='mt-1 max-w-full truncate'>{video.name}</span>
              )}
            </>
          )}
        </div>
        <div className='mt-2 flex w-full flex-col gap-y-4 sm:mt-0'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-wrap items-center gap-x-4'>
              <h2 className='text-xl font-bold md:text-3xl'>
                {modelo?.nombreCompleto}
                <span className='ml-2 text-2xl font-bold text-gray-600'>
                  ID: {modelo?.idLegible}
                </span>
              </h2>
              <Link
                href={`/mensajes/${modelo.telefono}`}
                className='rounded-md bg-slate-600 p-2'
                title='Enviar mensaje por chat'
              >
                <ChatFillIcon className='h-4 w-4 fill-white' />
              </Link>
              <a
                className='cursor-pointer rounded-md bg-lime-600 p-2'
                title='Enviar mensaje por WhatsApp'
                href={`https://wa.me/${modelo.telefono}`}
                target='_blank'
                rel='noreferrer'
              >
                <WhatsappIcon className='h-4 w-4 fill-white' />
              </a>
              {modelo.instagram && (
                <a
                  className='cursor-pointer rounded-md bg-[#c000b3] p-2'
                  title={`Instagram de ${modelo.nombreCompleto}`}
                  href={`https://instagram.com/${modelo.instagram}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  <InstagramIcon className='h-4 w-4 fill-white' />
                </a>
              )}
              {modelo.mail && (
                <a
                  className='cursor-pointer rounded-md bg-[#ea1c1c] p-2'
                  title={`Mail de ${modelo.nombreCompleto}`}
                  href={`mailto:${modelo.mail}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  <MailIcon className='h-4 w-4 fill-white' />
                </a>
              )}
            </div>
            {modelo.dni && (
              <p>
                <DNIIcon className='mr-2 inline-block h-5 w-5 fill-black' />
                <span>{modelo.dni}</span>
              </p>
            )}
            {modelo.nombresAlternativos.length > 0 && (
              <p className='text-sm text-black/80'>
                Nombres alternativos: {modelo.nombresAlternativos.join(', ')}
              </p>
            )}
            <div className='flex gap-x-4'>
              <p>
                Edad:{' '}
                {modelo.fechaNacimiento
                  ? `${edadFromFechaNacimiento(modelo.fechaNacimiento)} años`
                  : 'N/A'}
              </p>
              <p>Género: {modelo?.genero ?? 'N/A'}</p>
              <ModeloEditModal modelo={modelo} />
            </div>
          </div>
          <div className='hidden flex-wrap gap-2 md:flex'>
            <ListaEtiquetasModelo
              modeloId={modelo.id}
              etiquetas={etiquetasFiltradas}
            />
          </div>
        </div>
      </div>
      <div className='mt-4 flex flex-wrap gap-2 md:hidden'>
        <ListaEtiquetasModelo
          modeloId={modelo.id}
          etiquetas={etiquetasFiltradas}
        />
      </div>
      <div className='mt-3 flex flex-col gap-x-2 sm:flex-row sm:items-center'>
        {modelo.esPapelera && (
          <span className='order-2 font-bold text-red-500 sm:order-1'>
            La modelo está en la papelera
          </span>
        )}
        <div className='order-1 sm:order-2'>
          <BotonesPapelera id={modelo.id} esPapelera={modelo.esPapelera} />
        </div>
      </div>
      <div className='mt-5'>
        <h2 className='text-xl font-bold md:text-2xl'>Comentarios</h2>
        <CommentsSection profileId={modelo.id} />
      </div>
    </>
  );
};
export default ModeloPageContent;
