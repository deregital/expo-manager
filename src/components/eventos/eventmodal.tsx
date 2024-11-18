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
import { type RouterOutputs } from '@/server';
import EventFillIcon from '../icons/EventFillIcon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns/format';

interface EventModalProps {
  action: 'CREATE' | 'EDIT';
  event?: RouterOutputs['event']['getAll']['withoutFolder'][number];
}

type ModalData = {
  type: 'CREATE' | 'EDIT';
  name: string;
  date: string;
  location: string;
  folderId: string | null;
  subEvents: {
    id: string;
    name: string;
    date: string;
    location: string;
  }[];
  reset: () => void;
};

export const useEventModalData = create<ModalData>((set) => ({
  type: 'CREATE',
  name: '',
  date: new Date().toISOString(),
  location: '',
  folderId: null,
  subEvents: [],
  reset: () =>
    set({
      type: 'CREATE',
      name: '',
      date: new Date().toISOString(),
      location: '',
      folderId: null,
      subEvents: [],
    }),
}));

const EventModal = ({ action, event }: EventModalProps) => {
  const utils = trpc.useUtils();
  const modalData = useEventModalData((state) => ({
    type: state.type,
    name: state.name,
    date: state.date,
    folderId: state.folderId,
    location: state.location,
    subEvents: state.subEvents,
    reset: state.reset,
  }));

  const [open, setOpen] = useState(false);
  const [folderSelectOpen, setFolderSelectOpen] = useState(false);
  const [wantToDelete, setWantToDelete] = useState(false);
  const createEvent = trpc.event.create.useMutation();
  const deleteEvent = trpc.event.delete.useMutation();
  const updateEvent = trpc.event.update.useMutation();
  const { data: eventFolders } = trpc.eventFolder.getAll.useQuery();

  async function sendEvent() {
    if (modalData.type === 'CREATE') {
      await createEvent
        .mutateAsync({
          name: modalData.name,
          date: new Date(modalData.date),
          location: modalData.location,
          folderId: modalData.folderId,
          subEvents: modalData.subEvents.map((subevento) => ({
            id: subevento.id,
            name: subevento.name,
            date: new Date(subevento.date),
            location: subevento.location,
          })),
        })
        .then(() => {
          setOpen(!open);
          toast.success('Evento creado con éxito');
          utils.event.getAll.invalidate();
          utils.eventFolder.getAll.invalidate();
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
    } else if (modalData.type === 'EDIT') {
      if (!event) return;

      await updateEvent
        .mutateAsync({
          id: event.id,
          date: new Date(modalData.date),
          location: modalData.location,
          name: modalData.name,
          folderId: modalData.folderId,
          subEvents: modalData.subEvents.map((subevento) => ({
            id: subevento.id,
            name: subevento.name,
            date: new Date(subevento.date),
            location: subevento.location,
          })),
        })
        .then(() => {
          setOpen(!open);
          toast.success('Evento editado con éxito');
          utils.event.getAll.invalidate();
          utils.eventFolder.getAll.invalidate();
        })
        .catch((error) => {
          const errorString = JSON.parse(error.shape.message)[0].message;

          if (errorString) {
            toast.error(`Error al editar el evento, ${errorString}`);
          } else {
            toast.error('Error al editar el evento');
          }
        });
    }

    if (createEvent.isSuccess || updateEvent.isSuccess) {
      modalData.reset();
    }

    utils.event.getById.invalidate();
  }

  async function handleCancel() {
    modalData.reset();
    createEvent.reset();
    updateEvent.reset();
  }

  async function handleDelete() {
    if (!event) return;
    if (wantToDelete) {
      await deleteEvent
        .mutateAsync(event.id)
        .then(() => {
          setOpen(!open);
          toast.success('Evento eliminado con éxito');
        })
        .catch((error) => {
          console.log(error);
          toast.error('Error al eliminar el evento');
        });

      if (createEvent.isSuccess || updateEvent.isSuccess) {
        modalData.reset();
      }
      utils.event.getById.invalidate();
    } else {
      setWantToDelete(true);
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
                  modalData.reset();
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
                  if (!event) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);

                  useEventModalData.setState({
                    type: 'EDIT',
                    name: event.name,
                    date: event.date,
                    location: event.location,
                    folderId: event.folderId,
                    subEvents: event.subEvents.map((subevent) => ({
                      id: subevent.id,
                      name: subevent.name,
                      date: subevent.date,
                      location: subevent.location,
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
              {(modalData.type === 'CREATE' && 'Crear evento') ||
                (modalData.type === 'EDIT' && 'Editar evento')}
            </p>
            <div className='flex flex-col gap-3'>
              <div className='flex gap-3'>
                <Input
                  className='text-black'
                  type='text'
                  name='evento'
                  id='evento'
                  placeholder='Nombre del evento'
                  value={modalData.name}
                  onChange={(e) =>
                    useEventModalData.setState({ name: e.target.value })
                  }
                  required
                />
                <Input
                  type='datetime-local'
                  name='fecha'
                  id='fecha'
                  placeholder='Fecha del evento'
                  value={format(
                    modalData.date.length > 0 ? modalData.date : new Date(),
                    "yyyy-MM-dd'T'HH:mm"
                  )}
                  onChange={(e) =>
                    useEventModalData.setState({ date: e.target.value })
                  }
                  required
                />
              </div>
              <div className='flex gap-3'>
                <Input
                  className='text-black'
                  type='text'
                  name='ubicacion'
                  id='ubicacion'
                  placeholder='Ubicación'
                  value={modalData.location}
                  onChange={(e) =>
                    useEventModalData.setState({ location: e.target.value })
                  }
                  required
                />
                <Select
                  open={folderSelectOpen}
                  onOpenChange={setFolderSelectOpen}
                  value={modalData.folderId ?? 'N/A'}
                  onValueChange={(value) => {
                    useEventModalData.setState({
                      folderId: value === 'N/A' ? undefined : value,
                    });
                  }}
                  defaultValue={modalData.folderId ?? 'N/A'}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        modalData.folderId
                          ? eventFolders?.find(
                              (c) => c.id === modalData.folderId
                            )?.name
                          : 'Seleccione carpeta'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='N/A'>Sin carpeta</SelectItem> {}
                    {eventFolders?.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className='flex h-full max-h-64 flex-col gap-y-3 overflow-y-auto'>
            {modalData.subEvents.map((subevent, index) => (
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
                      value={subevent.name}
                      onChange={(e) => {
                        const updatedSubevents = [...modalData.subEvents];
                        updatedSubevents[index].name = e.target.value;
                        useEventModalData.setState({
                          subEvents: updatedSubevents,
                        });
                      }}
                      required // Atributo required agregado aquí
                    />
                    <Input
                      type='datetime-local'
                      placeholder='Fecha del subevento'
                      value={subevent.date.replace('Z', '')}
                      onChange={(e) => {
                        const updatedSubevents = [...modalData.subEvents];
                        updatedSubevents[index].date = e.target.value;
                        useEventModalData.setState({
                          subEvents: updatedSubevents,
                        });
                      }}
                      required // Atributo required agregado aquí
                    />
                  </div>
                  <div className='mb-1.5 flex gap-3'>
                    <Input
                      type='text'
                      placeholder='Ubicación del subevento'
                      value={subevent.location}
                      onChange={(e) => {
                        const updatedSubevents = [...modalData.subEvents];
                        updatedSubevents[index].location = e.target.value;
                        useEventModalData.setState({
                          subEvents: updatedSubevents,
                        });
                      }}
                      required
                    />
                    <Button
                      variant='destructive'
                      onClick={() => {
                        const updatedSubevents = [...modalData.subEvents];
                        updatedSubevents.splice(index, 1);
                        useEventModalData.setState({
                          subEvents: updatedSubevents,
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
              const updatedSubevents = [...modalData.subEvents];
              updatedSubevents.push({
                id: '',
                name: '',
                date: '',
                location: '',
              });
              useEventModalData.setState({ subEvents: updatedSubevents });
            }}
          >
            Agregar subevento
          </Button>
          {createEvent.isError || updateEvent.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createEvent.isError
                ? JSON.parse(createEvent.error.shape?.message ?? '[]')[0]
                    .message
                : ''}
              {updateEvent.isError
                ? JSON.parse(updateEvent.error.shape?.message ?? '[]')[0]
                    .message
                : ''}
            </p>
          ) : null}
          <div className='flex gap-x-4'>
            <Button
              className='w-full max-w-32'
              onClick={sendEvent}
              disabled={updateEvent.isLoading || createEvent.isLoading}
            >
              {((updateEvent.isLoading || createEvent.isLoading) && (
                <Loader />
              )) ||
                (modalData.type === 'CREATE' ? 'Crear' : 'Confirmar Edición')}
            </Button>
            {modalData.type === 'EDIT' && (
              <>
                <Button
                  variant='destructive'
                  className={cn({
                    'bg-red-700 hover:bg-red-500': wantToDelete,
                  })}
                  onClick={handleDelete}
                  disabled={
                    event?.subEvents !== undefined && event.subEvents.length > 0
                  }
                >
                  {event?.subEvents.length === 0
                    ? wantToDelete
                      ? '¿Estás seguro?'
                      : 'Eliminar'
                    : 'No se puede eliminar, primero elimine subeventos.'}
                </Button>
                {wantToDelete && (
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setWantToDelete(false);
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

export default EventModal;
