'use client';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { create } from 'zustand';
import {
  ModalTriggerCreate,
  ModalTriggerEdit,
} from '@/components/etiquetas/modal/ModalTrigger';
import EditFillIcon from '@/components/icons/EditFillIcon';
import { type RouterOutputs } from '@/server';
import EventFillIcon from '../../icons/EventFillIcon';

import EventModalForm from '@/components/eventos/modal/EventModalForm';
import { Button } from '@/components/ui/button';
import { cn, getErrorMessage, getTextColorByBg } from '@/lib/utils';
import Loader from '@/components/ui/loader';
import { toast } from 'sonner';
import { type Tag, type TagGroup, type EventTicket } from 'expo-backend-types';
import EventTicketsTable from '@/components/eventos/modal/EventTicketsTable';
import AddEtiquetaCombos from '@/components/ui/AddEtiquetaCombos';
import { Badge } from '@/components/ui/badge';
import CircleXIcon from '@/components/icons/CircleX';
import { format } from 'date-fns';

interface EventModalProps {
  action: 'CREATE' | 'EDIT';
  event?: RouterOutputs['event']['getAll']['withoutFolder'][number];
}

type ModalData = {
  type: 'CREATE' | 'EDIT';
  name: string;
  date: string;
  startingDate: string;
  endingDate: string;
  location: string;
  tags: (Pick<Tag, 'id' | 'name' | 'type'> & {
    group: Pick<TagGroup, 'id' | 'color' | 'isExclusive'>;
  })[];
  folderId: string | null;
  subEvents: {
    id: string;
    name: string;
    date: string;
    location: string;
    startingDate: string;
    endingDate: string;
  }[];
  tickets: (Pick<EventTicket, 'amount' | 'price' | 'type'> & {
    isFree: boolean;
  })[];
  reset: () => void;
};

const defaultTickets: ModalData['tickets'] = [
  {
    amount: 0,
    price: null,
    type: 'PARTICIPANT',
    isFree: true,
  },
  {
    amount: 0,
    price: null,
    type: 'SPECTATOR',
    isFree: true,
  },
  {
    amount: null,
    price: null,
    type: 'STAFF',
    isFree: true,
  },
];

function generateTicketsArray(
  tickets: Omit<ModalData['tickets'][number], 'isFree'>[]
) {
  return defaultTickets.map((ticket) => {
    const ticketData = tickets.find((t) => t.type === ticket.type);
    if (!ticketData) return ticket;

    return {
      ...ticket,
      amount: ticketData.amount,
      price: ticketData.price,
      isFree: ticketData.price === null,
    };
  });
}

export const useEventModalData = create<ModalData>((set) => ({
  type: 'CREATE',
  name: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  startingDate: new Date().toISOString(),
  endingDate: new Date().toISOString(),
  location: '',
  tags: [],
  folderId: null,
  subEvents: [],
  tickets: structuredClone(defaultTickets),
  reset: () => {
    set({
      type: 'CREATE',
      name: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startingDate: new Date().toISOString(),
      endingDate: new Date().toISOString(),
      location: '',
      folderId: null,
      tickets: structuredClone(defaultTickets),
      subEvents: [],
      tags: [],
    });
  },
}));

const EventModal = ({ action, event }: EventModalProps) => {
  const modalData = useEventModalData((state) => ({
    type: state.type,
    name: state.name,
    date: state.date,
    tags: state.tags,
    startingDate: state.startingDate,
    endingDate: state.endingDate,
    folderId: state.folderId,
    location: state.location,
    subEvents: state.subEvents,
    tickets: state.tickets,
    reset: state.reset,
  }));

  const [wantToDelete, setWantToDelete] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const utils = trpc.useUtils();
  const deleteEvent = trpc.event.delete.useMutation();
  const createEvent = trpc.event.create.useMutation();
  const updateEvent = trpc.event.update.useMutation();

  async function handleCancel() {
    modalData.reset();
    createEvent.reset();
    updateEvent.reset();
  }

  async function sendEvent() {
    if (modalData.type === 'CREATE') {
      await createEvent
        .mutateAsync({
          name: modalData.name,
          date: new Date(modalData.date),
          startingDate: new Date(modalData.startingDate),
          endingDate: new Date(modalData.endingDate),
          location: modalData.location,
          tagsId: modalData.tags.map((tag) => tag.id),
          folderId: modalData.folderId,
          description: null,
          mainPictureUrl: null,
          bannerUrl: null,
          subEvents: modalData.subEvents.map((subevento) => ({
            id: subevento.id,
            name: subevento.name,
            date: new Date(subevento.date),
            endingDate: new Date(subevento.endingDate),
            startingDate: new Date(subevento.startingDate),
            location: subevento.location,
            description: null,
            mainPictureUrl: null,
            bannerUrl: null,
          })),
          eventTickets: modalData.tickets, // TODO: Implementar tickets
        })
        .then(() => {
          setError('');
          setOpen(!open);
          toast.success('Evento creado con éxito');
          utils.event.getAll.invalidate();
          utils.eventFolder.getAll.invalidate();
        })
        .catch((error) => {
          const errorString = getErrorMessage(error);
          setError(errorString);

          if (errorString) {
            toast.error(`Error al crear el evento, ${errorString}`);
          } else {
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
          startingDate: new Date(modalData.startingDate),
          endingDate: new Date(modalData.endingDate),
          subEvents: modalData.subEvents.map((subEvent) => ({
            id: subEvent.id,
            name: subEvent.name,
            date: new Date(subEvent.date),
            endingDate: new Date(subEvent.endingDate),
            startingDate: new Date(subEvent.startingDate),
            location: subEvent.location,
          })),
          eventTickets: modalData.tickets.map((ticket) => ({
            amount: ticket.amount,
            price: ticket.price,
            type: ticket.type,
          })),
          tagsId: modalData.tags.map((tag) => tag.id),
        })
        .then(() => {
          setError('');
          setOpen(!open);
          toast.success('Evento editado con éxito');
          utils.event.getAll.invalidate();
          utils.eventFolder.getAll.invalidate();
        })
        .catch((error) => {
          const errorString = getErrorMessage(error);
          setError(errorString);

          if (error.message) {
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

  async function handleDelete() {
    if (!event) return;
    if (wantToDelete) {
      await deleteEvent
        .mutateAsync(event.id)
        .then(() => {
          setOpen(!open);
          toast.success('Evento eliminado con éxito');
          utils.event.getAll.invalidate();
        })
        .catch((error) => {
          toast.error(`Error al eliminar el evento: ${getErrorMessage(error)}`);
          setError(getErrorMessage(error));
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
                    startingDate: event.startingDate,
                    endingDate: event.endingDate,
                    location: event.location,
                    folderId: event.folderId,
                    tags: event.profileTags,
                    tickets: generateTicketsArray(event.eventTickets),
                    subEvents: event.subEvents.map((subevent) => ({
                      id: subevent.id,
                      name: subevent.name,
                      date: subevent.date,
                      location: subevent.location,
                      startingDate: subevent.startingDate,
                      endingDate: subevent.endingDate,
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
          className='mx-2 flex w-full flex-col gap-y-3 rounded-md bg-slate-100 px-6 py-4 md:max-w-4xl'
        >
          <p className='w-fit py-1.5 text-base font-bold'>
            {(modalData.type === 'CREATE' && 'Crear evento') ||
              (modalData.type === 'EDIT' && 'Editar evento')}
          </p>
          <div className='flex max-h-[70vh] flex-col gap-y-4 overflow-y-auto'>
            <EventModalForm />
            <EventTicketsTable />
            <div className='flex flex-col justify-between md:flex-row'>
              <div className='order-last md:order-first'>
                <AddEtiquetaCombos
                  tags={modalData.tags}
                  handleAddTag={(tag) => {
                    if (modalData.tags.find((t) => t.id === tag.id)) return;
                    useEventModalData.setState({
                      tags: [...modalData.tags, tag],
                    });
                  }}
                />
                <div className='mt-2 flex flex-wrap gap-2'>
                  {modalData.tags?.map((tag) => (
                    <Badge
                      className='group whitespace-nowrap transition-transform duration-200 ease-in-out hover:shadow-md'
                      style={{
                        backgroundColor: tag.group.color,
                        color: getTextColorByBg(tag.group.color),
                      }}
                      key={tag.id}
                    >
                      {tag.name}

                      <CircleXIcon
                        onClick={() => {
                          useEventModalData.setState({
                            tags: modalData.tags.filter((t) => t.id !== tag.id),
                          });
                        }}
                        className='invisible w-0 cursor-pointer group-hover:visible group-hover:ml-1 group-hover:w-4'
                        width={16}
                        height={16}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className='order-first flex flex-col flex-nowrap md:order-last'>
                <p className='whitespace-nowrap'>
                  Total de tickets:{' '}
                  {modalData.tickets.reduce((acc, ticket) => {
                    if (ticket.amount === null) return acc;
                    return acc + ticket.amount;
                  }, 0)}
                </p>
              </div>
            </div>
          </div>

          {createEvent.isError || updateEvent.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createEvent.isError && error}
              {updateEvent.isError && error}
              {deleteEvent.isError && error}
            </p>
          ) : null}
          <div className='flex gap-x-4'>
            <Button
              className='max-w-fit px-4'
              variant={'outline'}
              onClick={() => {
                const updatedSubevents = [...modalData.subEvents];
                updatedSubevents.push({
                  id: '',
                  name: '',
                  date: format(new Date(), 'yyyy-MM-dd'),
                  location: '',
                  endingDate: '',
                  startingDate: '',
                });
                useEventModalData.setState({ subEvents: updatedSubevents });
              }}
            >
              Agregar subevento
            </Button>
            <Button
              className='w-full'
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
                    deleteEvent.isLoading ||
                    (modalData.subEvents !== undefined &&
                      modalData.subEvents.length > 0)
                  }
                >
                  {modalData.subEvents.length === 0
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
