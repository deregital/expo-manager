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
    RouterOutputs['evento']['getAll'][number],
    'created_at' | 'updated_at'
  >;
}

type ModalData = {
  tipo: 'CREATE' | 'EDIT';
  nombre: string;
  fecha: string;
  ubicacion: string;
  subeventos: {
    id: string;
    nombre: string;
    fecha: string;
    ubicacion: string;
  }[];
};

export const useEventoModalData = create<ModalData>(() => ({
  tipo: 'CREATE',
  eventoPadre: '',
  nombre: '',
  fecha: '',
  ubicacion: '',
  subeventos: [],
}));

const EventoModal = ({ action, evento }: EventoModalProps) => {
  const utils = trpc.useUtils();
  const modalData = useEventoModalData((state) => ({
    tipo: state.tipo,
    nombre: state.nombre,
    fecha: state.fecha,
    ubicacion: state.ubicacion,
    subeventos: state.subeventos,
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
          fecha: modalData.fecha,
          ubicacion: modalData.ubicacion,
          subeventos: modalData.subeventos,
        })
        .then(() => {
          setOpen(!open);
          toast.success('Evento creado con éxito');
          utils.evento.getAll.invalidate();
        })
        .catch((error) => {
          try {
            const errorString = JSON.parse(error.shape.message)[0].message;
            if (errorString) {
              toast.error(`Error al crear el evento, ${errorString}`);
            }
          } catch (e) {
            toast.error('Error al crear el evento');
          }
        });
    } else if (modalData.tipo === 'EDIT') {
      if (!evento) return;
      await editEvento
        .mutateAsync({
          id: evento.id,
          fecha: modalData.fecha,
          ubicacion: modalData.ubicacion,
          nombre: modalData.nombre,
          subeventos: modalData.subeventos.map((subevento) => ({
            id: subevento.id,
            nombre: subevento.nombre,
            fecha: subevento.fecha,
            ubicacion: subevento.ubicacion,
          })),
        })
        .then(() => {
          setOpen(!open);
          toast.success('Evento editado con éxito');
          utils.evento.getAll.invalidate();
        })
        .catch((error: any) => {
          console.log(error);
          toast.error('Error al editar el evento');
        });
    }

    if (createEvento.isSuccess || editEvento.isSuccess) {
      useEventoModalData.setState({
        tipo: 'CREATE',
        nombre: '',
        fecha: '',
        ubicacion: '',
        subeventos: [],
      });
    }

    utils.evento.getById.invalidate();
  }

  async function handleCancel() {
    useEventoModalData.setState({
      tipo: 'CREATE',
      nombre: '',
      fecha: '',
      ubicacion: '',
      subeventos: [],
    });
    createEvento.reset();
    editEvento.reset();
  }

  async function handleDelete() {
    if (!evento) return;
    if (quiereEliminar) {
      await deleteEvento
        .mutateAsync({ id: evento.id })
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
          nombre: '',
          fecha: '',
          ubicacion: '',
          subeventos: [],
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
                    fecha: '',
                    ubicacion: '',
                    subeventos: [],
                  });
                }}
              >
                <span>
                  <EventFillIcon className='mr-3 h-6 w-6' />
                </span>
                Crear evento
              </ModalTriggerCreate>
            ) : (
              <ModalTriggerEdit
                onClick={(e) => {
                  if (!evento) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                  useEventoModalData.setState({
                    tipo: 'EDIT',
                    nombre: evento.nombre,
                    fecha: evento.fecha,
                    ubicacion: evento.ubicacion,
                    subeventos: evento.subEventos.map((subevento) => ({
                      id: subevento.id,
                      nombre: subevento.nombre,
                      fecha: subevento.fecha,
                      ubicacion: subevento.ubicacion,
                    })),
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
            <div className='flex flex-col gap-3'>
              <div className='flex gap-3'>
                <Input
                  className='text-black'
                  type='text'
                  name='evento'
                  id='evento'
                  placeholder='Nombre del evento'
                  value={modalData.nombre}
                  onChange={(e) =>
                    useEventoModalData.setState({ nombre: e.target.value })
                  }
                  required // Atributo required agregado aquí
                />
                <Input
                  type='datetime-local'
                  name='fecha'
                  id='fecha'
                  placeholder='Fecha del evento'
                  value={modalData.fecha.replace('Z', '')}
                  onChange={(e) =>
                    useEventoModalData.setState({ fecha: e.target.value })
                  }
                  required // Atributo required agregado aquí
                />
              </div>
              <div className='flex gap-3'>
                <Input
                  type='text'
                  name='ubicacion'
                  id='ubicacion'
                  placeholder='Ubicación del evento'
                  value={modalData.ubicacion}
                  onChange={(e) =>
                    useEventoModalData.setState({ ubicacion: e.target.value })
                  }
                  required // Atributo required agregado aquí
                />
              </div>
            </div>
          </div>
          {createEvento.isError || createEvento.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createEvento.isError ? 'Error al crear el evento' : ''}
              {editEvento.isError ? 'Error al editar el evento' : ''}
            </p>
          ) : null}
          <div className='flex h-full max-h-64 flex-col gap-y-3 overflow-y-auto'>
            {modalData.subeventos.map((subevento, index) => (
              <div key={index}>
                <hr className='mb-2 bg-slate-400' />
                <div
                  key={index}
                  className='mx-auto flex w-[98%] flex-col gap-y-1.5'
                >
                  <div className='flex gap-3'>
                    <Input
                      type='text'
                      placeholder='Nombre del subevento'
                      value={subevento.nombre}
                      onChange={(e) => {
                        const updatedSubeventos = [...modalData.subeventos];
                        updatedSubeventos[index].nombre = e.target.value;
                        useEventoModalData.setState({
                          subeventos: updatedSubeventos,
                        });
                      }}
                      required // Atributo required agregado aquí
                    />
                    <Input
                      type='datetime-local'
                      placeholder='Fecha del subevento'
                      value={subevento.fecha.replace('Z', '')}
                      onChange={(e) => {
                        const updatedSubeventos = [...modalData.subeventos];
                        updatedSubeventos[index].fecha = e.target.value;
                        useEventoModalData.setState({
                          subeventos: updatedSubeventos,
                        });
                      }}
                      required // Atributo required agregado aquí
                    />
                  </div>
                  <div className='mb-1.5 flex gap-3'>
                    <Input
                      type='text'
                      placeholder='Ubicación del subevento'
                      value={subevento.ubicacion}
                      onChange={(e) => {
                        const updatedSubeventos = [...modalData.subeventos];
                        updatedSubeventos[index].ubicacion = e.target.value;
                        useEventoModalData.setState({
                          subeventos: updatedSubeventos,
                        });
                      }}
                      required
                    />
                    <Button
                      variant='destructive'
                      onClick={() => {
                        const updatedSubeventos = [...modalData.subeventos];
                        updatedSubeventos.splice(index, 1);
                        useEventoModalData.setState({
                          subeventos: updatedSubeventos,
                        });
                      }}
                    >
                      Eliminar subevento
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => {
              const updatedSubeventos = [...modalData.subeventos];
              updatedSubeventos.push({
                id: '',
                nombre: '',
                fecha: '',
                ubicacion: '',
              });
              useEventoModalData.setState({ subeventos: updatedSubeventos });
            }}
          >
            Agregar subevento
          </Button>
          <div className='flex gap-x-4'>
            <Button
              className='w-full max-w-32'
              onClick={sendEvento}
              disabled={editEvento.isLoading || createEvento.isLoading}
            >
              {((editEvento.isLoading || createEvento.isLoading) && (
                <Loader />
              )) ||
                (modalData.tipo === 'CREATE' ? 'Crear' : 'Confirmar Edición')}
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
                    evento?.subEventos !== undefined &&
                    evento.subEventos.length > 0
                  }
                >
                  {evento?.subEventos.length === 0
                    ? quiereEliminar
                      ? '¿Estás seguro?'
                      : 'Eliminar'
                    : 'No se puede eliminar, primero elimine subeventos.'}
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
