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
import ComboBox from '@/components/ui/ComboBox';

interface EventoModalProps {
  action: 'CREATE' | 'EDIT';
  evento?: Omit<
    RouterOutputs['evento']['getAll'][number],
    'created_at' | 'updated_at'
  >;
}

type ModalData = {
  tipo: 'CREATE' | 'EDIT';
  eventoPadreId: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  eventoPadre: string;
  subeventos: { nombre: string; fecha: string; ubicacion: string }[];
};

export const useEventoModalData = create<ModalData>(() => ({
  tipo: 'CREATE',
  eventoPadre: '',
  nombre: '',
  fecha: '',
  ubicacion: '',
  eventoPadreId: '',
  subeventos: [],
}));

const EventoModal = ({ action, evento }: EventoModalProps) => {
  const { data: eventos, isLoading: eventosLoading } =
    trpc.evento.getAll.useQuery();

  const utils = trpc.useUtils();
  const modalData = useEventoModalData((state) => ({
    eventoPadreId: state.eventoPadreId,
    tipo: state.tipo,
    nombre: state.nombre,
    fecha: state.fecha,
    ubicacion: state.ubicacion,
    subeventos: state.subeventos,
  }));
  const [open, setOpen] = useState(false);
  const [openCombo, setOpenCombo] = useState(false);
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
          fecha: modalData.fecha,
          ubicacion: modalData.ubicacion,
        })
        .then(() => {
          setOpen(!open);
          toast.success('Evento creado con éxito');
        })
        .catch((error) => {
          console.log(error);
          toast.error('Error al crear el evento, asegúrese de poner un nombre');
        });
    } else if (modalData.tipo === 'EDIT') {
      if (!evento) return;
      await editEvento
        .mutateAsync({
          id: evento.id,
          eventoPadreId: useEventoModalData.getState().eventoPadreId,
          nombre: modalData.nombre,
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
        fecha: '',
        ubicacion: '',
        eventoPadreId: '',
        subeventos: [],
      });
    }

    utils.evento.getById.invalidate();
  }

  async function handleCancel() {
    useEventoModalData.setState({
      tipo: 'CREATE',
      eventoPadre: '',
      nombre: '',
      fecha: '',
      ubicacion: '',
      eventoPadreId: '',
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
          eventoPadreId: '',
          nombre: '',
          eventoPadre: '',
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
                    eventoPadre: '',
                    eventoPadreId: '',
                    fecha: '',
                    ubicacion: '',
                    subeventos: [],
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
                    eventoPadreId: evento?.eventoPadreId ?? '',
                    fecha: evento?.fecha ?? '',
                    ubicacion: evento?.ubicacion ?? '',
                    subeventos: [],
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
              <Input
                type='date'
                name='fecha'
                id='fecha'
                placeholder='Fecha del evento'
                value={modalData.fecha}
                onChange={(e) =>
                  useEventoModalData.setState({ fecha: e.target.value })
                }
              />
              <Input
                type='text'
                name='ubicacion'
                id='ubicacion'
                placeholder='Ubicación del evento'
                value={modalData.ubicacion}
                onChange={(e) =>
                  useEventoModalData.setState({ ubicacion: e.target.value })
                }
              />
              {eventosLoading ? (
                <Loader />
              ) : (
                <ComboBox
                  id='id'
                  onSelect={(value) => {
                    useEventoModalData.setState({
                      eventoPadreId: value,
                    });
                  }}
                  open={openCombo}
                  setOpen={setOpenCombo}
                  selectedIf={modalData.eventoPadreId}
                  triggerChildren={<span>Evento padre</span>}
                  value='nombre'
                  data={eventos ?? []}
                />
              )}
            </div>
          </div>
          {createEvento.isError || createEvento.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createEvento.isError
                ? createEvento.error?.data?.zodError?.fieldErrors.nombre?.[0] ||
                  createEvento.error?.data?.zodError?.fieldErrors
                    .grupoId?.[0] ||
                  'Error al crear el evento, asegúrese de poner un nombre'
                : ''}
              {editEvento.isError
                ? editEvento.error?.data?.zodError?.fieldErrors.nombre?.[0] ||
                  editEvento.error?.data?.zodError?.fieldErrors.grupoId?.[0] ||
                  'Error al editar el evento'
                : ''}
            </p>
          ) : null}
          {}
          {modalData.subeventos.map((subevento, index) => (
            <div key={index}>
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
              />
              <Input
                type='date'
                placeholder='Fecha del subevento'
                value={subevento.fecha}
                onChange={(e) => {
                  const updatedSubeventos = [...modalData.subeventos];
                  updatedSubeventos[index].fecha = e.target.value;
                  useEventoModalData.setState({
                    subeventos: updatedSubeventos,
                  });
                }}
              />
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
              />
            </div>
          ))}
          <Button
            onClick={() => {
              const updatedSubeventos = [...modalData.subeventos];
              updatedSubeventos.push({ nombre: '', fecha: '', ubicacion: '' });
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
                    evento?.subEventos !== undefined &&
                    evento.subEventos.length > 0
                  }
                >
                  {evento?.subEventos.length === 0
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
