'use client';
import FormCrearModelo from '@/components/modelos/FormCrearModelo';
import { trpc } from '@/lib/trpc';
import { ModelosSimilarity } from '@/server/types/modelos';
import clsx from 'clsx';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import Loader from '../ui/loader';
import { useCrearModeloModal } from './CrearModelo';
import { useEffect, useRef, useState } from 'react';
import ModelosSimilares from '@/components/modelos/ModelosSimilares';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const CrearModeloModal = ({ open }: { open: boolean }) => {
  const modalModelo = useCrearModeloModal();
  const utils = trpc.useUtils();
  const router = useRouter();
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
  const searchParams = new URLSearchParams(useSearchParams());
  const [eventoId, setEventoId] = useState<string | null>(
    searchParams.get('evento') ?? null
  );
  const pathname = usePathname();
  const [video, setVideo] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  const [similarity, setSimilarity] = useState<boolean>(false);
  const [similarityView, setSimilarityView] = useState<boolean>(false);
  const [similarityModelos, setSimilarityModelos] = useState<ModelosSimilarity>(
    []
  );
  const { data: etiquetaEvento } = trpc.evento.getById.useQuery(
    {
      id: eventoId ?? '',
    },
    {
      enabled: !!eventoId,
    }
  );
  const { data: etiquetaAsistio } = trpc.tag.getById.useQuery(
    etiquetaEvento?.etiquetaAsistioId ?? '',
    {
      enabled: !!etiquetaEvento,
    }
  );
  useEffect(() => {
    setEventoId(
      searchParams.get('evento') !== '' ? searchParams.get('evento') : null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('evento')]);

  async function handleSave() {
    const etiquetaInEvento = modalModelo.modelo.etiquetas.find(
      (e) => e.id === eventoId
    );

    const agregarEtiquetaEvento =
      !etiquetaInEvento && eventoId && eventoId !== '';
    const etiquetasInsertar = agregarEtiquetaEvento
      ? [...modalModelo.modelo.etiquetas, etiquetaAsistio!]
      : modalModelo.modelo.etiquetas;

    const telefonoParseado = modalModelo.modelo.telefono.startsWith('549')
      ? modalModelo.modelo.telefono
      : `549${modalModelo.modelo.telefono}`;

    const telefonosecParseado = modalModelo.modelo.telefonoSecundario
      ? modalModelo.modelo.telefonoSecundario.startsWith('549')
        ? modalModelo.modelo.telefonoSecundario
        : `549${modalModelo.modelo.telefonoSecundario}`
      : undefined;

    const res = await createModelo
      .mutateAsync({
        modelo: {
          nombreCompleto: modalModelo.modelo.nombreCompleto,
          telefono: telefonoParseado,
          telefonoSecundario: telefonosecParseado,
          dni: modalModelo.modelo.dni ?? undefined,
          mail: modalModelo.modelo.mail ?? undefined,
          fechaNacimiento: modalModelo.modelo.fechaNacimiento
            ? modalModelo.modelo.fechaNacimiento.toISOString()
            : undefined,
          instagram: modalModelo.modelo.instagram,
          etiquetas: etiquetasInsertar.map((e) => e.id),
          apodos: modalModelo.modelo.apodos.filter((e) => e !== ''),
          paisNacimiento: modalModelo.modelo.paisNacimiento,
          provinciaNacimiento: modalModelo.modelo.provinciaNacimiento,
          provinciaResidencia: modalModelo.modelo.residencia?.provincia,
          localidadResidencia: modalModelo.modelo.residencia?.localidad,
          residenciaLatitud: modalModelo.modelo.residencia?.latitud,
          residenciaLongitud: modalModelo.modelo.residencia?.longitud,
          comentarios: modalModelo.modelo.comentarios,
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
      setSimilarity(false);
      utils.modelo.getAll.invalidate();
      modalModelo.resetModelo();
      searchParams.delete('modal');
      if (eventoId && eventoId !== '') {
        searchParams.delete('evento');
        searchParams.set('persona', 'creada');
        router.push(
          `eventos/${eventoId}/presentismo?${searchParams.toString()}`
        );
      } else {
        router.push(`${pathname}?${searchParams.toString()}`);
      }
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
    modalModelo.resetModelo();
    searchParams.delete('modal');
    setVideo(null);
    setFotoUrl(null);
    setSimilarity(false);

    if (createModelo.isSuccess) return;
    if (eventoId && eventoId !== '') {
      router.push(`eventos/${eventoId}/presentismo`);
      searchParams.delete('evento');
    } else {
      router.push(`${pathname}?${searchParams.toString()}`);
      searchParams.delete('evento');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        searchParams.delete('modal');
        router.push(`${pathname}?${searchParams.toString()}`);
      }}
    >
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
                      ? 'participante similar.'
                      : 'participantes similares.'}
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
  );
};

export default CrearModeloModal;
