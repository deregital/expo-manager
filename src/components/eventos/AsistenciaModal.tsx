'use client';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { trpc } from '@/lib/trpc';
import ComboBox from '../ui/ComboBox';
import { useMemo, useState } from 'react';
import ModeloIcon from '../icons/ModeloIcon';
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
  const { data: modelos } = trpc.modelo.getAll.useQuery();
  const utils = trpc.useUtils();
  const router = useRouter();
  const searchParams = new URLSearchParams(useSearchParams());
  const editModelo = trpc.modelo.edit.useMutation();

  const { data: EtiquetaAsistencia } = trpc.etiqueta.getById.useQuery(
    modalPresentismo.evento?.etiquetaAsistioId ?? '',
    {
      enabled: !!modalPresentismo.evento,
    }
  );

  const modelosData = useMemo(() => {
    if (!modelos) return [];
    return modelos
      .filter((modelo) =>
        modelo.etiquetas.every(
          (etiqueta) =>
            etiqueta.id !== modalPresentismo.evento?.etiquetaAsistioId &&
            etiqueta.id !== modalPresentismo.evento?.etiquetaConfirmoId
        )
      )
      .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
  }, [
    modalPresentismo.evento?.etiquetaAsistioId,
    modalPresentismo.evento?.etiquetaConfirmoId,
    modelos,
  ]);

  async function handleSubmit() {
    if (modalPresentismo.modeloId === '') {
      toast.error('Debes seleccionar un participante');
    }

    if (modalPresentismo.evento === null) {
      toast.error('No se ha encontrado el evento');
    }

    const modelo = modelos?.find(
      (modelo) => modelo.id === modalPresentismo.modeloId
    );

    if (!modelo) {
      toast.error('No se ha encontrado el participante');
      return;
    }

    const etiquetasModelo = modelo?.etiquetas
      .map((etiqueta) => ({
        id: etiqueta.id,
        nombre: etiqueta.nombre,
        grupo: {
          id: etiqueta.grupoId,
          esExclusivo: etiqueta.grupo.esExclusivo,
        },
      }))
      .filter(
        (etiqueta) =>
          etiqueta.id !== modalPresentismo.evento?.etiquetaConfirmoId
      );

    const etiquetaAsistio = {
      id: modalPresentismo.evento!.etiquetaAsistioId,
      nombre: EtiquetaAsistencia!.nombre,
      grupo: {
        id: EtiquetaAsistencia!.grupo.id,
        esExclusivo: EtiquetaAsistencia!.grupo.esExclusivo,
      },
    };

    await editModelo.mutateAsync({
      id: modalPresentismo.modeloId,
      etiquetas: [...etiquetasModelo!, etiquetaAsistio],
    });
    toast.success('Participante añadido correctamente');
    utils.modelo.getByEtiqueta.invalidate();
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
        <div className='flex items-center justify-between'>
          <div className='flex items-center justify-center gap-x-2'>
            <ComboBox
              data={modelosData}
              id={'id'}
              value='nombreCompleto'
              open={openModelos}
              setOpen={setOpenModelos}
              wFullMobile
              triggerChildren={
                <>
                  <span className='max-w-[calc(100%-30px)] truncate'>
                    {modalPresentismo.modeloId !== ''
                      ? modelos?.find(
                          (modelo) => modelo.id === modalPresentismo.modeloId
                        )?.nombreCompleto
                      : 'Buscar participante...'}
                  </span>
                  <ModeloIcon className='h-5 w-5' />
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
            <Button
              onClick={() => {
                searchParams.set('modal', 'true');
                searchParams.set('evento', modalPresentismo.evento?.id ?? '');
                router.push(`/modelos?${searchParams.toString()}`);
              }}
            >
              Crear
            </Button>
          </div>
          <Button disabled={editModelo.isLoading} onClick={handleSubmit}>
            Añadir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AsistenciaModal;
