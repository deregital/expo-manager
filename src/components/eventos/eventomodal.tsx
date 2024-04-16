'use client';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { create } from 'zustand';
import { Button } from '@/components/ui/button';
import {
  ModalTriggerCreate,
  ModalTriggerEdit,
} from '@/components/etiquetas/modal/ModalTrigger';
import EditFillIcon from '@/components/icons/EditFillIcon';
import { toast } from 'sonner';
import Loader from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import EventFillIcon from '../icons/EventFillIcon';

interface EventoModalProps {
    action: 'CREATE' | 'EDIT';
    evento?: Omit<
      RouterOutputs['evento']['getById'][number]['eventos'][number],
      'created_at' | 'updated_at'
    >;
  }

  type ModalData = {
    tipo: 'CREATE' | 'EDIT';
    eventoPadreId: string;
    nombre: string;
    eventoPadre: string;
  };
  
  export const useEventoModalData = create<ModalData>(() => ({
    tipo: 'CREATE',
    eventoPadre: '',
    nombre: '',
    eventoPadreId: '',
  }));

  const EventoModal = ({ action, evento }: EventoModalProps) => {
    const { data: getevento, isLoading } =
      trpc.evento.();
  
    const utils = trpc.useUtils();
    const modalData = useEventoModalData((state) => ({
     eventoPadreId: state.eventoPadreId,
      tipo: state.tipo,
      nombre: state.nombre,
    }));
    const [open, setOpen] = useState(false);
    const [quiereEliminar, setQuiereEliminar] = useState(false);
    const createEvento = trpc.evento.create.useMutation();
    const deleteEvento = trpc.evento.delete.useMutation();
    const editEvento = trpc.evento.update.useMutation();

    async function sendEvento() {
        if (modalData.tipo === 'CREATE') {
          await createEvento
            .mutateAsync({
                nombre: modalData.nombre,
                eventoPadreId: useEventoModalData.getState().eventoPadreId,
                fecha: '',
                ubicacion: ''
            })
            .then(() => {
              setOpen(!open);
              toast.success('Evento creada con éxito');
            })
            .catch((error) => {
              console.log(error);
              toast.error(
                'Error al crear el evento, asegúrese de poner un nombre'
              );
            });
        } else if (modalData.tipo === 'EDIT') {
          await editEvento
            .mutateAsync({
                eventoPadreId: useEventoModalData.getState().eventoPadreId,
              nombre: modalData.nombre,
              eventoPadre: useEventoModalData.getState().eventoPadre,
            })
            .then(() => {
              setOpen(!open);
              toast.success('Evento editado con éxito');
            })
            .catch((error: any) => {
              console.log(error);
              toast.error('Error al editar el evento');
            });
        }

        if (createEvento.isSuccess || editEvento.isSuccess) {
            useEventoModalData.setState({
              tipo: 'CREATE',
              eventoPadre: '',
              nombre: '',
              eventoPadreId: '',
            });
          }
      
          utils.evento.getById.invalidate();
        }
      
        async function handleCancel() {
          useEventoModalData.setState({
            tipo: 'CREATE',
            eventoPadre: '',
            nombre: '',
            eventoPadreId: '',
          });
          createEvento.reset();
          editEvento.reset();
        }

        async function handleDelete() {
            if (quiereEliminar) {
              await deleteEvento
                .mutateAsync(modalData.eventoPadre)
                .then(() => {
                  setOpen(!open);
                  toast.success('Evento eliminado con éxito');
                })
                .catch((error) => {
                  console.log(error);
                  toast.error('Error al eliminar el evento');
                });
        
              if (createEvento.isSuccess || editEvento.isSuccess) {
                useEventoModalData.setState({
                  tipo: 'CREATE',
                  eventoPadreId: '',
                  nombre: '',
                  eventoPadre: '',
                });
              }
              utils.evento.getById.invalidate();
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
                  useEventoModalData.setState({
                    tipo: 'CREATE',
                    nombre: '',
                    eventoPadre: '',
                    eventoPadreId: '',
                  });
                }}
              >
                <span>
                  <EventFillIcon className='mr-3 h-6 w-6' />
                </span>
                Crear etiqueta
              </ModalTriggerCreate>
            ) : (
              <ModalTriggerEdit
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(true);
                  useEventoModalData.setState({
                    tipo: 'EDIT',
                    eventoPadre: evento?.id ?? '',
                    nombre: evento?.nombre ?? '',
                    eventoPadreId: evento?.grupoId ?? '',
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
              {(modalData.tipo === 'CREATE' && 'Crear evento') ||
                (modalData.tipo === 'EDIT' && 'Editar evento')}
            </p>
            <div className='flex gap-x-3'>
              <Input
                className='bg-white text-black'
                type='text'
                name='evento'
                id='evento'
                placeholder='Nombre del evento'
                value={modalData.nombre}
                onChange={(e) =>
                  useEventoModalData.setState({ nombre: e.target.value })
                }
              />
              {isLoading ? (
                <Loader />
              ) : (
                <EventoComboBox data={getevento ?? []} /> 
              )}
            </div>
          </div>
          {createEvento.isError || createEvento.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createEvento.isError
                ? createEvento.error?.data?.zodError?.fieldErrors
                    .nombre?.[0] ||
                    createEvento.error?.data?.zodError?.fieldErrors
                    .grupoId?.[0] ||
                  'Error al crear el evento, asegúrese de poner un nombre'
                : ''}
              {editEvento.isError
                ? editEvento.error?.data?.zodError?.fieldErrors.nombre?.[0] ||
                  editEvento.error?.data?.zodError?.fieldErrors
                    .grupoId?.[0] ||
                  'Error al editar el evento'
                : ''}
            </p>
          ) : null}
          <div className='flex gap-x-4'>
            <Button
              className='w-full max-w-32'
              onClick={sendEvento}
              disabled={editEvento.isLoading || createEvento.isLoading}
            >
              {((editEvento.isLoading || createEvento.isLoading) && (
                <Loader />
              )) ||
                (modalData.tipo === 'CREATE' ? 'Crear' : 'Editar')}
            </Button>
            {modalData.tipo === 'EDIT' && (
              <>
                <Button
                  variant='destructive'
                  className={cn({
                    'bg-red-700 hover:bg-red-500': quiereEliminar,
                  })}
                  onClick={handleDelete}
                  disabled={
                    evento?._count.getevento !== undefined &&
                    evento._count.getevento > 0
                  }
                >
                  {evento?._count.perfiles === 0
                    ? quiereEliminar
                      ? '¿Estás seguro?'
                      : 'Eliminar'
                    : 'No se puede eliminar'}
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

export default EventoModal;

