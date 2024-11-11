'use client';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { trpc } from '@/lib/trpc';
import ComboBox from '../ui/ComboBox';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';
import { RouterOutputs } from '@/server';
import { useRouter, useSearchParams } from 'next/navigation';

type PresentismoModal = {
  isOpen: boolean;
  evento: RouterOutputs['evento']['getById'] | null;
  profileId: string;
};
export const usePresentismoModal = create<PresentismoModal>((set) => ({
  isOpen: false,
  evento: null,
  profileId: '',
}));

const AsistenciaModal = ({ open }: { open: boolean }) => {
  const modalPresentismo = usePresentismoModal();
  const [openProfiles, setOpenProfiles] = useState(false);
  const { data: profiles } = trpc.profile.getAll.useQuery();
  const utils = trpc.useUtils();
  const router = useRouter();
  const searchParams = new URLSearchParams(useSearchParams());
  const editProfile = trpc.profile.edit.useMutation();

  const profilesData = useMemo(() => {
    if (!profiles) return [];
    return profiles
      .filter((profile) =>
        profile.tags.every(
          (tag) =>
            tag.id !== modalPresentismo.evento?.etiquetaAsistioId &&
            tag.id !== modalPresentismo.evento?.etiquetaConfirmoId
        )
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [
    modalPresentismo.evento?.etiquetaAsistioId,
    modalPresentismo.evento?.etiquetaConfirmoId,
    profiles,
  ]);

  async function handleSubmit() {
    if (modalPresentismo.profileId === '') {
      toast.error('Debes seleccionar un participante');
    }

    if (modalPresentismo.evento === null) {
      toast.error('No se ha encontrado el evento');
    }

    const profile = profiles?.find(
      (profile) => profile.id === modalPresentismo.profileId
    );

    if (!profile) {
      toast.error('No se ha encontrado el participante');
      return;
    }

    const participantTagsId = profile?.tags
      .map((tag) => tag.id)
      .filter((tagId) => tagId !== modalPresentismo.evento?.etiquetaConfirmoId);

    const tagAssistedId = modalPresentismo.evento!.etiquetaAsistioId;

    await editProfile.mutateAsync({
      id: modalPresentismo.profileId,
      tags: [...participantTagsId, tagAssistedId],
    });
    toast.success('Participante añadido correctamente');
    utils.profile.getByTags.invalidate();
    usePresentismoModal.setState({ isOpen: false, profileId: '' });
  }

  if (!modalPresentismo.evento || modalPresentismo.evento === null) return;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => usePresentismoModal.setState({ isOpen: value })}
    >
      <DialogTrigger asChild>
        <Button onClick={() => usePresentismoModal.setState({ isOpen: !open })}>
          Agregar persona
        </Button>
      </DialogTrigger>
      <DialogContent>
        <h3 className='text-lg font-semibold'>
          Añadir asistencia de un participante
        </h3>
        <div className='flex items-center justify-between gap-x-4'>
          <div className='flex w-full items-center justify-center'>
            <ComboBox
              buttonClassName='md:w-full'
              contentClassName='sm:max-w-[--radix-popover-trigger-width]'
              data={profilesData}
              id={'id'}
              value='fullName'
              open={openProfiles}
              setOpen={setOpenProfiles}
              wFullMobile
              triggerChildren={
                <>
                  <span className='max-w-[calc(100%-30px)] truncate'>
                    {modalPresentismo.profileId !== ''
                      ? profiles?.find(
                          (profile) => profile.id === modalPresentismo.profileId
                        )?.fullName
                      : 'Buscar participante...'}
                  </span>
                </>
              }
              onSelect={(id) => {
                if (modalPresentismo.profileId === id) {
                  usePresentismoModal.setState({ profileId: '' });
                  setOpenProfiles(false);
                  return;
                }
                usePresentismoModal.setState({ profileId: id });
                setOpenProfiles(false);
              }}
              selectedIf={modalPresentismo.profileId}
            />
          </div>
          <Button disabled={editProfile.isLoading} onClick={handleSubmit}>
            Añadir
          </Button>
        </div>
        <h3
          className='cursor-pointer text-right text-lg underline underline-offset-4 hover:text-blue-500'
          onClick={() => {
            searchParams.set('modal', 'true');
            searchParams.set('evento', modalPresentismo.evento?.id ?? '');
            router.push(`/modelos?${searchParams.toString()}`);
          }}
        >
          Crear nueva persona
        </h3>
      </DialogContent>
    </Dialog>
  );
};

export default AsistenciaModal;
