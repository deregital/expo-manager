import { useEventModalData } from '@/components/eventos/modal/eventmodal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { type RouterOutputs } from '@/server';
import { format } from 'date-fns';
import { Trash } from 'lucide-react';
import { useState } from 'react';

interface EventModalFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  event?: RouterOutputs['event']['getAll']['withoutFolder'][number];
}

const EventModalForm = ({ open, setOpen, event }: EventModalFormProps) => {
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
            <FormTextInput
              type='date'
              name='fecha'
              id='fecha'
              label='Fecha'
              placeholder={format(new Date(2018, 11, 18), 'yyyy-MM-dd')}
              value={format(
                modalData.date.length > 0
                  ? modalData.date.replace(/-/g, '/')
                  : new Date().toString().replace(/-/g, '/'),
                'yyyy-MM-dd'
              )}
              onChange={(e) => {
                useEventModalData.setState({ date: e.target.value });
              }}
              required
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
                  const date = new Date(modalData.date);
                  const [hours, minutes] = e.target.value.split(':');
                  date.setMinutes(Number(minutes));
                  date.setHours(Number(hours));

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
                disabled={modalData.date === ''}
                value={
                  modalData.endingDate
                    ? format(modalData.endingDate, 'HH:mm')
                    : ''
                }
                onChange={(e) => {
                  const date = new Date(modalData.date);
                  const [hours, minutes] = e.target.value.split(':');
                  date.setMinutes(Number(minutes));
                  date.setHours(Number(hours));

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
                <FormTextInput
                  type='date'
                  label='Fecha del subevento'
                  placeholder={format(new Date(2018, 11, 18), 'yyyy-MM-dd')}
                  value={subevent.date}
                  onChange={(e) => {
                    const updatedSubevents = [...modalData.subEvents];
                    updatedSubevents[index].date = e.target.value;
                    useEventModalData.setState({
                      subEvents: updatedSubevents,
                    });
                  }}
                  required // Atributo required agregado aquí
                />
              </FieldRow>
              <FieldRow className=''>
                <FormTextInput
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
                    modalData.subEvents[index].startingDate
                      ? format(modalData.subEvents[index].startingDate, 'HH:mm')
                      : ''
                  }
                  onChange={(e) => {
                    const date = new Date(modalData.subEvents[index].date);
                    const [hours, minutes] = e.target.value.split(':');
                    date.setUTCMinutes(Number(hours), Number(minutes));

                    const updatedSubevents = [...modalData.subEvents];
                    updatedSubevents[index].startingDate = date.toISOString();

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
                    modalData.subEvents[index].endingDate
                      ? format(modalData.subEvents[index].endingDate, 'HH:mm')
                      : ''
                  }
                  onChange={(e) => {
                    const date = new Date(modalData.subEvents[index].date);
                    const [hours, minutes] = e.target.value.split(':');
                    date.setUTCMinutes(Number(hours), Number(minutes));

                    const updatedSubevents = [...modalData.subEvents];
                    updatedSubevents[index].startingDate = date.toISOString();

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

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FormTextInput = ({
  label,
  name,
  className,
  ...props
}: FormInputProps) => (
  <div className='flex flex-col gap-y-1'>
    <Label className='slate-900 text-sm font-medium' htmlFor={name}>
      {label}
    </Label>
    <Input id={name} className={cn('w-full', className)} {...props} />
  </div>
);

const FieldRow = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('flex items-end gap-3 md:gap-7 [&>*]:flex-1', className)}>
    {children}
  </div>
);
