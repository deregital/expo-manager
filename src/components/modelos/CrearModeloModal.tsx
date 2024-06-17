'use client';
import FormCrearModelo from '@/components/modelos/FormCrearModelo';
import { trpc } from '@/lib/trpc';
import { ModelosSimilarity } from '@/server/types/modelos';
import clsx from 'clsx';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import Loader from '../ui/loader';
import { useCrearModeloModal } from './CrearModelo';
import { useRef, useState } from 'react';
import ModelosSimilares from '@/components/modelos/ModelosSimilares';

const CrearModeloModal = ({ open }: { open: boolean }) => {
  const modalModelo = useCrearModeloModal();
  const utils = trpc.useUtils();
  const createModelo = trpc.modelo.createManual.useMutation({
    onError: (error) => {
      if (
        error?.data?.zodError?.fieldErrors &&
        Object.keys(error?.data?.zodError?.fieldErrors).length > 0
      ) {
        const primerError = Object.values(
          error?.data?.zodError?.fieldErrors
        )[0];
        toast.error(primerError ? primerError[0] : error.message);
      }

      if (
        error.data?.code === 'CONFLICT' ||
        error.data?.code === 'PARSE_ERROR'
      ) {
        toast.error(error.message);
      }
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  const [similarity, setSimilarity] = useState<boolean>(false);
  const [similarityView, setSimilarityView] = useState<boolean>(false);
  const [similarityModelos, setSimilarityModelos] = useState<ModelosSimilarity>(
    []
  );

  async function handleSave() {
    const res = await createModelo
      .mutateAsync({
        modelo: {
          nombreCompleto: modalModelo.modelo.nombreCompleto,
          telefono: modalModelo.modelo.telefono,
          dni: modalModelo.modelo.dni ?? undefined,
          mail: modalModelo.modelo.mail ?? undefined,
          fechaNacimiento: modalModelo.modelo.fechaNacimiento
            ? modalModelo.modelo.fechaNacimiento.toISOString()
            : undefined,
          instagram: modalModelo.modelo.instagram,
          etiquetas: modalModelo.modelo.etiquetas.map((e) => e.id),
          apodos: modalModelo.modelo.apodos.filter((e) => e !== ''),
        },
        similarity: similarity,
      })
      .catch((e) => {
        return;
      });

    if (!res) return;

    if (Array.isArray(res)) {
      setSimilarity(true);
      setSimilarityModelos(
        res.map((r) => ({
          similarityTelefono: r.similarityTelefono,
          similarityNombre: r.similarityNombre,
          modelo: {
            ...r.modelo,
          },
        }))
      );
    } else {
      await handleUpload(res.id);
      toast.success('Participante creado correctamente');
      utils.modelo.getAll.invalidate();
      useCrearModeloModal.setState({
        open: false,
        modelo: {
          nombreCompleto: '',
          telefono: '',
          fechaNacimiento: undefined,
          genero: 'N/A',
          etiquetas: [],
          apodos: [],
          dni: '',
          mail: '',
          instagram: '',
        },
      });
    }
  }

  async function handleUpload(id: string) {
    if (!video) return;
    const form = new FormData();
    form.append('imagen', video);
    form.append('id', id);
    form.append('url', fotoUrl ?? '');

    await fetch('/api/image', {
      method: 'POST',
      body: form,
    })
      .then(() => {
        if (inputRef.current) {
          inputRef.current!.value = '';
        }
        setVideo(null);
        setFotoUrl(null);
      })
      .catch((e) => {
        setVideo(null);
        setFotoUrl(null);
      });
  }

  async function handleCancel() {
    useCrearModeloModal.setState({
      open: false,
      modelo: {
        nombreCompleto: '',
        telefono: '',
        fechaNacimiento: undefined,
        genero: 'N/A',
        etiquetas: [],
        apodos: [],
        dni: '',
        mail: '',
        instagram: '',
      },
    });
    setVideo(null);
    setFotoUrl(null);
    setSimilarity(false);
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={() =>
          useCrearModeloModal.setState({ open: !modalModelo.open })
        }
      >
        <DialogTrigger></DialogTrigger>
        <DialogContent onCloseAutoFocus={handleCancel}>
          <div className='flex flex-col gap-y-0.5'>
            <p className='text-xl font-semibold'>
              Crear participante manualmente
            </p>
            {!similarityView ? (
              <div className='mt-1 flex max-h-[400px] flex-col gap-y-1 overflow-y-auto px-2'>
                <FormCrearModelo
                  video={video}
                  setVideo={setVideo}
                  setFotoUrl={setFotoUrl}
                  inputRef={inputRef}
                />
              </div>
            ) : (
              <div className='flex max-h-[400px] flex-col gap-y-2 overflow-y-auto'>
                <ModelosSimilares similarityModelos={similarityModelos} />
                <Button onClick={() => setSimilarityView(false)}>Volver</Button>
              </div>
            )}
            <div
              className={clsx(
                `flex gap-x-2 pt-2`,
                similarity ? 'justify-between' : 'justify-end'
              )}
            >
              {similarity && (
                <div>
                  <span className='align-middle text-xs'>
                    Hay{' '}
                    <span
                      className='cursor-pointer font-semibold underline'
                      onClick={() => setSimilarityView(true)}
                    >
                      {similarityModelos.length}{' '}
                      {similarityModelos.length === 1
                        ? 'modelo similar.'
                        : 'modelos similares.'}
                    </span>{' '}
                    ¿Quieres agregar a este participante?
                  </span>
                </div>
              )}
              <Button
                onClick={handleSave}
                className='flex justify-center gap-x-2'
                disabled={createModelo.isLoading}
              >
                {createModelo.isLoading ?? <Loader className='h-5 w-5' />}
                <p>{similarity ? 'Agregar igualmente' : 'Guardar'}</p>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CrearModeloModal;
