'use client';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import GrupoEtiquetaComboBox from './GrupoEtiquetaComboBox';
import { useState } from 'react';
import { create } from 'zustand';
import { Button } from '@/components/ui/button';
import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import {
  ModalTriggerCreate,
  ModalTriggerEdit,
} from '@/components/etiquetas/modal/ModalTrigger';
import EditFillIcon from '@/components/icons/EditFillIcon';
import { toast } from 'sonner';
import Loader from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { type FindAllWithTagsResponseDto } from 'expo-backend-types';

interface EtiquetaModalProps {
  action: 'CREATE' | 'EDIT';
  tag?: FindAllWithTagsResponseDto['groups'][number]['tags'][number];
}

type ModalData = {
  tipo: 'CREATE' | 'EDIT';
  grupoId: string;
  nombre: string;
  etiquetaId: string;
};

export const useEtiquetaModalData = create<ModalData>(() => ({
  tipo: 'CREATE',
  grupoId: '',
  nombre: '',
  etiquetaId: '',
}));

const EtiquetaModal = ({ action, tag }: EtiquetaModalProps) => {
  const { data: getGrupoEtiquetas, isLoading } =
    trpc.grupoEtiqueta.getAll.useQuery();

  const utils = trpc.useUtils();
  const modalData = useEtiquetaModalData((state) => ({
    etiquetaId: state.etiquetaId,
    tipo: state.tipo,
    nombre: state.nombre,
  }));
  const [open, setOpen] = useState(false);
  const [quiereEliminar, setQuiereEliminar] = useState(false);
  const createEtiqueta = trpc.etiqueta.create.useMutation();
  const editEtiqueta = trpc.etiqueta.edit.useMutation();
  const deleteEtiqueta = trpc.etiqueta.delete.useMutation();

  async function sendEtiqueta() {
    if (modalData.tipo === 'CREATE') {
      await createEtiqueta
        .mutateAsync({
          nombre: modalData.nombre,
          grupoId: useEtiquetaModalData.getState().grupoId,
        })
        .then(() => {
          setOpen(!open);
          toast.success('Etiqueta creada con éxito');
        })
        .catch((error) => {
          console.log(error);
          toast.error(
            'Error al crear la etiqueta, asegúrese de poner un nombre y seleccionar un grupo de etiquetas'
          );
        });
    } else if (modalData.tipo === 'EDIT') {
      await editEtiqueta
        .mutateAsync({
          id: useEtiquetaModalData.getState().etiquetaId,
          nombre: modalData.nombre,
          grupoId: useEtiquetaModalData.getState().grupoId,
        })
        .then(() => {
          setOpen(!open);
          toast.success('Etiqueta editada con éxito');
        })
        .catch((error) => {
          console.log(error);
          toast.error('Error al editar la etiqueta');
        });
    }

    if (createEtiqueta.isSuccess || editEtiqueta.isSuccess) {
      useEtiquetaModalData.setState({
        tipo: 'CREATE',
        grupoId: '',
        nombre: '',
        etiquetaId: '',
      });
    }

    utils.etiqueta.getByNombre.invalidate();
  }

  async function handleCancel() {
    useEtiquetaModalData.setState({
      tipo: 'CREATE',
      grupoId: '',
      nombre: '',
      etiquetaId: '',
    });
    createEtiqueta.reset();
    editEtiqueta.reset();
  }

  async function handleDelete() {
    if (quiereEliminar) {
      await deleteEtiqueta
        .mutateAsync(modalData.etiquetaId)
        .then(() => {
          setOpen(!open);
          toast.success('Etiqueta eliminada con éxito');
        })
        .catch((error) => {
          console.log(error);
          toast.error('Error al eliminar la etiqueta');
        });

      if (createEtiqueta.isSuccess || editEtiqueta.isSuccess) {
        useEtiquetaModalData.setState({
          tipo: 'CREATE',
          grupoId: '',
          nombre: '',
          etiquetaId: '',
        });
      }

      utils.etiqueta.getByNombre.invalidate();
    } else {
      setQuiereEliminar(true);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <>
            {action === 'CREATE' ? (
              <ModalTriggerCreate
                onClick={() => {
                  setOpen(true);
                  useEtiquetaModalData.setState({
                    tipo: 'CREATE',
                    nombre: '',
                    grupoId: '',
                    etiquetaId: '',
                  });
                }}
              >
                <span>
                  <EtiquetaFillIcon className='mr-3 h-6 w-6' />
                </span>
                Crear etiqueta
              </ModalTriggerCreate>
            ) : (
              <ModalTriggerEdit
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(true);
                  useEtiquetaModalData.setState({
                    tipo: 'EDIT',
                    etiquetaId: tag?.id ?? '',
                    nombre: tag?.name ?? '',
                    grupoId: tag?.groupId ?? '',
                  });
                }}
              >
                <EditFillIcon />
              </ModalTriggerEdit>
            )}
          </>
        </DialogTrigger>
        <DialogContent
          onCloseAutoFocus={handleCancel}
          className='flex w-full flex-col gap-y-3 rounded-md bg-slate-100 px-5 py-3 md:mx-auto md:max-w-2xl'
        >
          <div className='flex flex-col gap-y-0.5'>
            <p className='w-fit py-1.5 text-base font-semibold'>
              {(modalData.tipo === 'CREATE' && 'Crear etiqueta') ||
                (modalData.tipo === 'EDIT' && 'Editar etiqueta')}
            </p>
            <div className='flex gap-x-3'>
              <Input
                className='bg-white text-black'
                type='text'
                name='etiqueta'
                id='etiqueta'
                placeholder='Nombre de la etiqueta'
                value={modalData.nombre}
                onChange={(e) =>
                  useEtiquetaModalData.setState({ nombre: e.target.value })
                }
              />
              {isLoading ? (
                <Loader />
              ) : (
                <GrupoEtiquetaComboBox data={getGrupoEtiquetas ?? []} />
              )}
            </div>
          </div>
          {createEtiqueta.isError || editEtiqueta.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createEtiqueta.isError
                ? createEtiqueta.error?.data?.zodError?.fieldErrors
                    .nombre?.[0] ||
                  createEtiqueta.error?.data?.zodError?.fieldErrors
                    .grupoId?.[0] ||
                  'Error al crear la etiqueta, asegúrese de poner un nombre y asignarle un grupo'
                : ''}
              {editEtiqueta.isError
                ? editEtiqueta.error?.data?.zodError?.fieldErrors.nombre?.[0] ||
                  editEtiqueta.error?.data?.zodError?.fieldErrors
                    .grupoId?.[0] ||
                  'Error al editar la etiqueta'
                : ''}
            </p>
          ) : null}
          <div className='flex gap-x-4'>
            <Button
              className='w-full max-w-32'
              onClick={sendEtiqueta}
              disabled={editEtiqueta.isLoading || createEtiqueta.isLoading}
            >
              {((editEtiqueta.isLoading || createEtiqueta.isLoading) && (
                <Loader />
              )) ||
                (modalData.tipo === 'CREATE' ? 'Crear' : 'Editar')}
            </Button>
            {modalData.tipo === 'EDIT' && (
              <>
                <Button
                  variant='destructive'
                  className={cn('h-auto text-wrap', {
                    'bg-red-700 hover:bg-red-500': quiereEliminar,
                  })}
                  onClick={handleDelete}
                  disabled={
                    tag?._count.profiles !== undefined &&
                    tag._count.profiles > 0
                  }
                >
                  {tag?._count.profiles === 0
                    ? quiereEliminar
                      ? '¿Estás seguro?'
                      : 'Eliminar'
                    : 'No se puede eliminar, la etiqueta tiene participantes asociados'}
                </Button>
                {quiereEliminar && (
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setQuiereEliminar(false);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EtiquetaModal;
