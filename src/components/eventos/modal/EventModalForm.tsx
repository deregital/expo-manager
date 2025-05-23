import { useEventModalData } from '@/components/eventos/modal/eventmodal';
import { Button } from '@/components/ui/button';
import { FieldRow, FormDateInput, FormTextInput } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  applyFullDateToDate,
  applyHoursAndMinutesToDate,
} from '@/lib/date-utils';
import { trpc } from '@/lib/trpc';
import { addDays, format } from 'date-fns';
import { Trash } from 'lucide-react';
import { useState } from 'react';

const EventModalForm = () => {
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
    reset: state.reset,
  }));
  const { data: eventFolders } = trpc.eventFolder.getAll.useQuery();

  const [folderSelectOpen, setFolderSelectOpen] = useState(false);

  return (
    <>
      <div className='flex flex-col gap-y-0.5'>
        <div className='flex flex-col gap-3'>
          <FieldRow>
            <FormTextInput
              className='text-black'
              type='text'
              name='evento'
              id='evento'
              label='Nombre del evento'
              placeholder='Mi evento'
              value={modalData.name}
              onChange={(e) =>
                useEventModalData.setState({ name: e.target.value })
              }
              required
            />
          </FieldRow>
          <FieldRow>
            <FormTextInput
              className='text-black'
              type='text'
              name='ubicacion'
              id='ubicacion'
              label='Ubicación'
              placeholder='Roxy, Juan B. Justo 1893, Buenos Aires'
              value={modalData.location}
              onChange={(e) =>
                useEventModalData.setState({ location: e.target.value })
              }
              required
            />
            <FormDateInput
              name='fecha'
              label='Fecha'
              min={addDays(new Date(), -1)}
              value={
                modalData && modalData.date.length > 0
                  ? new Date(modalData.date)
                  : new Date()
              }
              onChange={(date) => {
                if (!date) return;

                const startingDate = applyFullDateToDate(
                  useEventModalData.getState().startingDate,
                  date
                );
                const endingDate = applyFullDateToDate(
                  useEventModalData.getState().endingDate,
                  date
                );

                useEventModalData.setState({
                  date: date.toISOString(),
                  startingDate: startingDate.toISOString(),
                  endingDate: endingDate.toISOString(),
                });
              }}
            />
          </FieldRow>
          <FieldRow className='grid grid-cols-1 md:grid-cols-2 md:grid-rows-1'>
            <div className='order-last flex flex-col gap-y-1 md:order-first'>
              <Label className='slate-900 text-sm font-medium'>Carpeta</Label>
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
                <SelectTrigger className='flex-1'>
                  <SelectValue
                    placeholder={
                      modalData.folderId
                        ? eventFolders?.find((c) => c.id === modalData.folderId)
                            ?.name
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
            <FieldRow className='order-first md:order-last'>
              <FormTextInput
                className='text-black'
                type='time'
                name='startingDate'
                id='startingDate'
                label='Horario de inicio'
                disabled={modalData.date === ''}
                value={
                  modalData.startingDate
                    ? format(modalData.startingDate, 'HH:mm')
                    : ''
                }
                onChange={(e) => {
                  const date = applyHoursAndMinutesToDate(
                    modalData.date,
                    e.target.value
                  );

                  useEventModalData.setState({
                    startingDate: date.toISOString(),
                  });
                }}
                required
              />
              <FormTextInput
                className='text-black'
                type='time'
                name='endingDate'
                id='endingDate'
                label='Horario de cierre'
                min={format(modalData.startingDate, 'HH:mm')}
                disabled={modalData.date === ''}
                value={
                  modalData.endingDate
                    ? format(modalData.endingDate, 'HH:mm')
                    : ''
                }
                onChange={(e) => {
                  const date = applyHoursAndMinutesToDate(
                    modalData.date,
                    e.target.value
                  );

                  useEventModalData.setState({
                    endingDate: date.toISOString(),
                  });
                }}
                required
              />
            </FieldRow>
          </FieldRow>
        </div>
      </div>
      <div className='flex h-full flex-col gap-y-3'>
        {modalData.subEvents.map((subevent, index) => (
          <div key={index}>
            <hr className='mb-2 bg-slate-400' />
            <div
              key={index}
              className='mx-auto flex w-[98%] flex-col gap-y-1.5'
            >
              <FieldRow>
                <FormTextInput
                  type='text'
                  name={`subevent-${index}`}
                  label='Nombre del subevento'
                  placeholder='Mi Subevento'
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
                <FormDateInput
                  name='date'
                  min={new Date()}
                  label='Fecha del subevento'
                  value={addDays(new Date(subevent.date), 1)}
                  onChange={(date) => {
                    if (!date) return;

                    const updatedSubevents = [...modalData.subEvents];
                    updatedSubevents[index].date = format(date, 'yyyy-MM-dd');

                    updatedSubevents[index].startingDate = applyFullDateToDate(
                      updatedSubevents[index].startingDate,
                      date
                    ).toISOString();
                    updatedSubevents[index].endingDate = applyFullDateToDate(
                      updatedSubevents[index].endingDate,
                      date
                    ).toISOString();

                    useEventModalData.setState({
                      subEvents: updatedSubevents,
                    });
                  }}
                />
              </FieldRow>
              <FieldRow className=''>
                <FormTextInput
                  name={`location-${index}`}
                  type='text'
                  label='Ubicación del subevento'
                  placeholder='Roxy, Juan B. Justo 1893, Buenos Aires'
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
                <FormTextInput
                  className='text-black'
                  type='time'
                  name='startingDate'
                  id='startingDate'
                  label='Horario de inicio'
                  disabled={modalData.subEvents[index].date === ''}
                  value={
                    modalData.subEvents[index].startingDate.length > 0
                      ? format(modalData.subEvents[index].startingDate, 'HH:mm')
                      : ''
                  }
                  onChange={(e) => {
                    const updatedSubevents = [...modalData.subEvents];
                    updatedSubevents[index].startingDate =
                      applyHoursAndMinutesToDate(
                        modalData.subEvents[index].date,
                        e.target.value
                      ).toISOString();

                    useEventModalData.setState({
                      subEvents: updatedSubevents,
                    });
                  }}
                  required
                />
                <FormTextInput
                  className='text-black'
                  type='time'
                  name='endingDate'
                  id='endingDate'
                  label='Horario de cierre'
                  disabled={modalData.subEvents[index].date === ''}
                  value={
                    modalData.subEvents[index].endingDate.length > 0
                      ? format(modalData.subEvents[index].endingDate, 'HH:mm')
                      : ''
                  }
                  onChange={(e) => {
                    const updatedSubevents = [...modalData.subEvents];
                    updatedSubevents[index].endingDate =
                      applyHoursAndMinutesToDate(
                        modalData.subEvents[index].date,
                        e.target.value
                      ).toISOString();

                    useEventModalData.setState({
                      subEvents: updatedSubevents,
                    });
                  }}
                  required
                />
              </FieldRow>
              <Button
                className='aspect-square'
                variant='destructive'
                onClick={() => {
                  const updatedSubevents = [...modalData.subEvents];
                  updatedSubevents.splice(index, 1);
                  useEventModalData.setState({
                    subEvents: updatedSubevents,
                  });
                }}
              >
                <Trash />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default EventModalForm;
