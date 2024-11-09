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
  modeloId: string;
};
export const usePresentismoModal = create<PresentismoModal>((set) => ({
  isOpen: false,
  evento: null,
  modeloId: '',
}));

const AsistenciaModal = ({ open }: { open: boolean }) => {
  const modalPresentismo = usePresentismoModal();
  const [openModelos, setOpenModelos] = useState(false);
  const { data: profiles } = trpc.modelo.getAll.useQuery();
  const utils = trpc.useUtils();
  const router = useRouter();
  const searchParams = new URLSearchParams(useSearchParams());
  const editModelo = trpc.modelo.edit.useMutation();

  const { data: assistanceTag } = trpc.tag.getById.useQuery(
    modalPresentismo.evento?.etiquetaAsistioId ?? '',
    {
      enabled: !!modalPresentismo.evento,
    }
  );

  const modelosData = useMemo(() => {
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
    if (modalPresentismo.modeloId === '') {
      toast.error('Debes seleccionar un participante');
    }

    if (modalPresentismo.evento === null) {
      toast.error('No se ha encontrado el evento');
    }

    const modelo = profiles?.find(
      (modelo) => modelo.id === modalPresentismo.modeloId
    );

    if (!modelo) {
      toast.error('No se ha encontrado el participante');
      return;
    }

    const participantTags = modelo?.tags
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        group: {
          id: tag.groupId,
          isExclusive: tag.group.isExclusive,
        },
      }))
      .filter((tag) => tag.id !== modalPresentismo.evento?.etiquetaConfirmoId);

    const tagAssisted = {
      id: modalPresentismo.evento!.etiquetaAsistioId,
      name: assistanceTag!.name,
      group: {
        id: assistanceTag!.group.id,
        isExclusive: assistanceTag!.group.isExclusive,
      },
    };

    await editModelo.mutateAsync({
      id: modalPresentismo.modeloId,
      // @ts-expect-error TODO: Fix this
      tags: [...participantTags!, tagAssisted] as any[],
    });
    toast.success('Participante añadido correctamente');
    utils.modelo.getByTags.invalidate();
    usePresentismoModal.setState({ isOpen: false, modeloId: '' });
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
              data={modelosData}
              id={'id'}
              value='fullName'
              open={openModelos}
              setOpen={setOpenModelos}
              wFullMobile
              triggerChildren={
                <>
                  <span className='max-w-[calc(100%-30px)] truncate'>
                    {modalPresentismo.modeloId !== ''
                      ? profiles?.find(
                          (modelo) => modelo.id === modalPresentismo.modeloId
                        )?.fullName
                      : 'Buscar participante...'}
                  </span>
                </>
              }
              onSelect={(id) => {
                if (modalPresentismo.modeloId === id) {
                  usePresentismoModal.setState({ modeloId: '' });
                  setOpenModelos(false);
                  return;
                }
                usePresentismoModal.setState({ modeloId: id });
                setOpenModelos(false);
              }}
              selectedIf={modalPresentismo.modeloId}
            />
          </div>
          <Button disabled={editModelo.isLoading} onClick={handleSubmit}>
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
