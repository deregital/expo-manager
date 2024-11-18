'use client';
import CreateProfileForm from '@/components/modelos/CreateProfileForm';
import { trpc } from '@/lib/trpc';
import clsx from 'clsx';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import Loader from '../ui/loader';
import { useCreateProfileModal } from './CreateProfile';
import { useEffect, useRef, useState } from 'react';
import SimilarProfiles from '@/components/modelos/SimilarProfiles';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type SimilarityProfile } from 'expo-backend-types';

const ModalCreateProfile = ({ open }: { open: boolean }) => {
  const modalProfile = useCreateProfileModal();
  const utils = trpc.useUtils();
  const router = useRouter();
  const createProfile = trpc.profile.create.useMutation({
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
  const [eventId, setEventId] = useState<string | null>(
    searchParams.get('evento') ?? null
  );
  const pathname = usePathname();
  const [video, setVideo] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  const [similarity, setSimilarity] = useState<boolean>(false);
  const [similarityView, setSimilarityView] = useState<boolean>(false);
  const [similarityProfiles, setSimilarityProfiles] = useState<
    SimilarityProfile[]
  >([]);
  const { data: etiquetaEvento } = trpc.event.getById.useQuery(eventId ?? '', {
    enabled: !!eventId,
  });
  const { data: etiquetaAsistio } = trpc.tag.getById.useQuery(
    etiquetaEvento?.tagAssistedId ?? '',
    {
      enabled: !!etiquetaEvento,
    }
  );
  useEffect(() => {
    setEventId(
      searchParams.get('evento') !== '' ? searchParams.get('evento') : null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('evento')]);

  async function handleSave() {
    const etiquetaInEvento = modalProfile.profile.tags.find(
      (e) => e.id === eventId
    );

    const agregarEtiquetaEvento =
      !etiquetaInEvento && eventId && eventId !== '';
    const etiquetasInsertar = agregarEtiquetaEvento
      ? [...modalProfile.profile.tags, etiquetaAsistio!]
      : modalProfile.profile.tags;

    const res = await createProfile
      .mutateAsync({
        profile: {
          fullName: modalProfile.profile.fullName,
          phoneNumber: modalProfile.profile.phoneNumber,
          secondaryPhoneNumber:
            modalProfile.profile.secondaryPhoneNumber ?? null,
          dni: modalProfile.profile.dni ?? null,
          mail: modalProfile.profile.mail ?? null,
          birthDate: modalProfile.profile.birthDate
            ? modalProfile.profile.birthDate.toISOString()
            : null,
          gender: modalProfile.profile.gender ?? null,
          profilePictureUrl: fotoUrl ?? null,
          instagram: modalProfile.profile.instagram,
          tags: etiquetasInsertar.map((e) => e.id),
          alternativeNames: modalProfile.profile.alternativeNames.filter(
            (e) => e !== ''
          ),
          birth: modalProfile.profile.birthLocation,
          residence: modalProfile.profile.residenceLocation,
          comments: modalProfile.profile.comments.map((c) => ({
            content: c.content,
            isSolvable: c.isSolvable,
          })),
        },
        checkForSimilarity: !similarity,
      })
      .catch((e) => {
        return;
      });

    if (!res) return;

    if (res.type === 'similar') {
      setSimilarity(true);
      setSimilarityProfiles(res.similarProfiles);
    } else {
      await handleUpload(res.id);
      toast.success('Participante creado correctamente');
      setSimilarity(false);
      utils.profile.getAll.invalidate();
      modalProfile.resetProfile();
      searchParams.delete('modal');
      if (eventId && eventId !== '') {
        searchParams.delete('evento');
        searchParams.set('persona', 'creada');
        router.push(
          `eventos/${eventId}/presentismo?${searchParams.toString()}`
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
    modalProfile.resetProfile();
    searchParams.delete('modal');
    setVideo(null);
    setFotoUrl(null);
    setSimilarity(false);

    if (createProfile.isSuccess) return;
    if (eventId && eventId !== '') {
      router.push(`eventos/${eventId}/presentismo`);
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
              <CreateProfileForm
                video={video}
                setVideo={setVideo}
                setFotoUrl={setFotoUrl}
                inputRef={inputRef}
              />
            </div>
          ) : (
            <div className='flex max-h-[400px] flex-col gap-y-2 overflow-y-auto'>
              <SimilarProfiles similarityProfiles={similarityProfiles} />
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
                    {similarityProfiles.length}{' '}
                    {similarityProfiles.length === 1
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
              disabled={createProfile.isLoading}
            >
              {createProfile.isLoading ?? <Loader className='h-5 w-5' />}
              <p>{similarity ? 'Agregar igualmente' : 'Guardar'}</p>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCreateProfile;
