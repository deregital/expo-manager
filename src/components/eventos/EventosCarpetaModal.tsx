'use client';
import { useMemo, useState } from 'react';
import { create } from 'zustand';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import EditFillIcon from '@/components/icons/EditFillIcon';
import { toast } from 'sonner';
import Loader from '@/components/ui/loader';
import ColorPicker from '@/components/ui/ColorPicker';
import { cn, randomColor } from '@/lib/utils';
import FolderIcon from '@/components/icons/FolderIcon';
import { RouterOutputs } from '@/server';

interface EventosCarpetaModalProps {
  action: 'EDIT' | 'CREATE';
  eventosCarpeta?: RouterOutputs['evento']['getAll']['carpetas'][number];
}

type EventosCarpetaModalData = {
  tipo: 'CREATE' | 'EDIT';
  nombre: string;
  carpetaId: string;
  color: string;
};

export const useEventosCarpetaModalData = create<EventosCarpetaModalData>(
  () => ({
    tipo: 'CREATE',
    nombre: '',
    carpetaId: '',
    color: randomColor(),
  })
);

const EventosCarpetaModal = ({
  action,
  eventosCarpeta,
}: EventosCarpetaModalProps) => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const createEventosCarpeta = trpc.carpetaEventos.create.useMutation();
  const editEventosCarpeta = trpc.carpetaEventos.edit.useMutation();
  const deleteEventosCarpeta = trpc.carpetaEventos.delete.useMutation();

  const modalData = useEventosCarpetaModalData((state) => ({
    tipo: state.tipo,
    nombre: state.nombre,
    carpetaId: state.carpetaId,
    color: state.color,
  }));

  async function handleCancel() {
    useEventosCarpetaModalData.setState({
      tipo: 'CREATE',
      nombre: '',
      carpetaId: '',
      color: randomColor(),
    });
    createEventosCarpeta.reset();
    editEventosCarpeta.reset();
  }

  async function handleSubmit() {
    const { tipo, nombre, carpetaId, color } =
      useEventosCarpetaModalData.getState();
    if (tipo === 'CREATE') {
      await createEventosCarpeta
        .mutateAsync({ nombre, color })
        .then(() => {
          setOpen(false);
          utils.evento.getAll.invalidate();
          utils.carpetaEventos.getAll.invalidate();
          toast.success('Carpeta de eventos creada con éxito');
        })
        .catch(() => {
          setOpen(true);
          toast.error('Error al crear la carpeta de eventos');
        });
    } else if (tipo === 'EDIT') {
      await editEventosCarpeta
        .mutateAsync({ id: carpetaId, nombre, color })
        .then(() => {
          setOpen(false);
          utils.evento.getAll.invalidate();
          utils.carpetaEventos.getAll.invalidate();
          toast.success('Carpeta de eventos editada con éxito');
        })
        .catch(() => {
          setOpen(true);
          toast.error('Error al editar la carpeta de eventos');
        });
    }
    if (createEventosCarpeta.isSuccess || editEventosCarpeta.isSuccess) {
      useEventosCarpetaModalData.setState({
        tipo: 'CREATE',
        nombre: '',
        carpetaId: '',
        color: randomColor(),
      });
    }
  }

  async function handleDelete() {
    if (eventosCarpeta) {
      if (eventosCarpeta.eventos && eventosCarpeta.eventos.length > 0) {
        toast.error('No se puede eliminar la carpeta, contiene eventos.');
        setOpen(true);
        return;
      }
      await deleteEventosCarpeta
        .mutateAsync(eventosCarpeta.id)
        .then(() => {
          setOpen(false);
          utils.carpetaEventos.getAll.invalidate();
          toast.success('Carpeta de eventos eliminada con éxito');
        })
        .catch(() => {
          setOpen(true);
          toast.error('Error al eliminar la carpeta de eventos');
        });
    }
  }

  const submitDisabled = useMemo(() => {
    if (modalData.tipo === 'CREATE') {
      return createEventosCarpeta.isLoading;
    } else {
      return editEventosCarpeta.isLoading;
    }
  }, [
    createEventosCarpeta.isLoading,
    editEventosCarpeta.isLoading,
    modalData.tipo,
  ]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {action === 'CREATE' ? (
            <Button
              className='flex items-center gap-x-3 rounded-md bg-gray-400 px-5 py-0.5 text-gray-950 hover:bg-gray-300'
              onClick={() => {
                setOpen(true);
                useEventosCarpetaModalData.setState({
                  tipo: 'CREATE',
                  nombre: '',
                  carpetaId: '',
                  color: randomColor(),
                });
              }}
            >
              <FolderIcon className='size-6' />
              <span>Crear carpeta de eventos</span>
            </Button>
          ) : (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
                useEventosCarpetaModalData.setState({
                  tipo: 'EDIT',
                  carpetaId: eventosCarpeta?.id ?? '',
                  nombre: eventosCarpeta?.nombre ?? '',
                  color: eventosCarpeta?.color ?? '',
                });
              }}
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                }),
                'flex h-fit items-center rounded-full p-0.5'
              )}
            >
              <EditFillIcon />
            </div>
          )}
        </DialogTrigger>
        <DialogContent
          onClick={(e) => {
            e.stopPropagation();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            setOpen(false);
            handleCancel();
          }}
          className='flex w-full flex-col gap-y-3 rounded-md bg-slate-100 px-5 py-3 md:mx-auto md:max-w-2xl'
        >
          <div className='flex flex-col gap-y-1'>
            <p className='w-fit py-1.5 text-base font-semibold'>
              {modalData.tipo === 'CREATE'
                ? 'Crear carpeta de eventos'
                : 'Editar carpeta de eventos'}
            </p>
            <div className='relative flex items-center gap-x-2'>
              <Input
                type='text'
                name='nombre'
                id='nombre'
                placeholder='Nombre de la carpeta'
                value={modalData.nombre}
                onChange={(e) => {
                  useEventosCarpetaModalData.setState({
                    nombre: e.target.value,
                  });
                }}
              />
              <ColorPicker
                color={modalData.color}
                setColor={(color) => {
                  useEventosCarpetaModalData.setState({
                    color,
                  });
                }}
              />
            </div>
          </div>
          {createEventosCarpeta.isError || editEventosCarpeta.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createEventosCarpeta.isError
                ? JSON.parse(createEventosCarpeta.error?.message)[0].message ||
                  'Error al crear la carpeta de eventos'
                : ''}
              {editEventosCarpeta.isError
                ? JSON.parse(editEventosCarpeta.error?.message)[0].message ||
                  'Error al editar la carpeta de eventos'
                : ''}
            </p>
          ) : null}

          <div className='flex gap-x-4'>
            <Button
              className='w-full max-w-32'
              onClick={handleSubmit}
              disabled={submitDisabled}
            >
              {((editEventosCarpeta.isLoading ||
                createEventosCarpeta.isLoading) && <Loader />) ||
                (modalData.tipo === 'CREATE' ? 'Crear' : 'Editar')}
            </Button>
            {modalData.tipo === 'EDIT' && eventosCarpeta && (
              <Button
                variant='destructive'
                className='h-auto text-wrap bg-red-700 hover:bg-red-500'
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventosCarpetaModal;
