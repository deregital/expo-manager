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

interface EventsFolderModalProps {
  action: 'EDIT' | 'CREATE';
  eventsFolder?: RouterOutputs['evento']['getAll']['carpetas'][number];
}

type EventsFolderModalData = {
  type: 'CREATE' | 'EDIT';
  name: string;
  folderId: string;
  color: string;
};

export const useEventsFolderModalData = create<EventsFolderModalData>(() => ({
  type: 'CREATE',
  name: '',
  folderId: '',
  color: randomColor(),
}));

const EventsFolderModal = ({
  action,
  eventsFolder,
}: EventsFolderModalProps) => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const createEventFolder = trpc.eventFolder.create.useMutation();
  const updateEventFolder = trpc.eventFolder.update.useMutation();
  const deleteEventFolder = trpc.eventFolder.delete.useMutation();

  const modalData = useEventsFolderModalData((state) => ({
    type: state.type,
    name: state.name,
    folderId: state.folderId,
    color: state.color,
  }));

  async function handleCancel() {
    useEventsFolderModalData.setState({
      type: 'CREATE',
      name: '',
      folderId: '',
      color: randomColor(),
    });
    createEventFolder.reset();
    updateEventFolder.reset();
  }

  async function handleSubmit() {
    const { type, name, folderId, color } = useEventsFolderModalData.getState();
    if (type === 'CREATE') {
      await createEventFolder
        .mutateAsync({ name, color })
        .then(() => {
          setOpen(false);
          utils.evento.getAll.invalidate();
          utils.eventFolder.getAll.invalidate();
          toast.success('Carpeta de eventos creada con éxito');
        })
        .catch(() => {
          setOpen(true);
          toast.error('Error al crear la carpeta de eventos');
        });
    } else if (type === 'EDIT') {
      await updateEventFolder
        .mutateAsync({ id: folderId, name, color })
        .then(() => {
          setOpen(false);
          utils.evento.getAll.invalidate();
          utils.eventFolder.getAll.invalidate();
          toast.success('Carpeta de eventos editada con éxito');
        })
        .catch(() => {
          setOpen(true);
          toast.error('Error al editar la carpeta de eventos');
        });
    }
    if (createEventFolder.isSuccess || updateEventFolder.isSuccess) {
      useEventsFolderModalData.setState({
        type: 'CREATE',
        name: '',
        folderId: '',
        color: randomColor(),
      });
    }
  }

  async function handleDelete() {
    if (eventsFolder) {
      if (eventsFolder.eventos && eventsFolder.eventos.length > 0) {
        toast.error('No se puede eliminar la carpeta, contiene eventos.');
        setOpen(true);
        return;
      }
      await deleteEventFolder
        .mutateAsync(eventsFolder.id)
        .then(() => {
          setOpen(false);
          utils.eventFolder.getAll.invalidate();
          toast.success('Carpeta de eventos eliminada con éxito');
        })
        .catch(() => {
          setOpen(true);
          toast.error('Error al eliminar la carpeta de eventos');
        });
    }
  }

  const submitDisabled = useMemo(() => {
    if (modalData.type === 'CREATE') {
      return createEventFolder.isLoading;
    } else {
      return updateEventFolder.isLoading;
    }
  }, [
    createEventFolder.isLoading,
    updateEventFolder.isLoading,
    modalData.type,
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
                useEventsFolderModalData.setState({
                  type: 'CREATE',
                  name: '',
                  folderId: '',
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
                useEventsFolderModalData.setState({
                  type: 'EDIT',
                  folderId: eventsFolder?.id ?? '',
                  name: eventsFolder?.nombre ?? '',
                  color: eventsFolder?.color ?? '',
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
              {modalData.type === 'CREATE'
                ? 'Crear carpeta de eventos'
                : 'Editar carpeta de eventos'}
            </p>
            <div className='relative flex items-center gap-x-2'>
              <Input
                type='text'
                name='nombre'
                id='nombre'
                placeholder='Nombre de la carpeta'
                value={modalData.name}
                onChange={(e) => {
                  useEventsFolderModalData.setState({
                    name: e.target.value,
                  });
                }}
              />
              <ColorPicker
                color={modalData.color}
                setColor={(color) => {
                  useEventsFolderModalData.setState({
                    color,
                  });
                }}
              />
            </div>
          </div>
          {createEventFolder.isError || updateEventFolder.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createEventFolder.isError
                ? JSON.parse(createEventFolder.error?.message)[0].message ||
                  'Error al crear la carpeta de eventos'
                : ''}
              {updateEventFolder.isError
                ? JSON.parse(updateEventFolder.error?.message)[0].message ||
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
              {((updateEventFolder.isLoading ||
                createEventFolder.isLoading) && <Loader />) ||
                (modalData.type === 'CREATE' ? 'Crear' : 'Editar')}
            </Button>
            {modalData.type === 'EDIT' && eventsFolder && (
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

export default EventsFolderModal;
