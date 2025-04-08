import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FormTextInput } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { iconsAndTexts } from '@/components/ui/ticket/iconsAndTexts';
import { trpc } from '@/lib/trpc';
import { getErrorMessage, objectEntries } from '@/lib/utils';
import { type TicketType } from 'expo-backend-types';
import { useState } from 'react';
import { create } from 'zustand';

type TicketModalData = {
  type: Exclude<TicketType, 'PARTICIPANT'>;
  fullName: string;
  dni: string;
  email: string;
  reset: () => void;
};

const useTicketModalData = create<TicketModalData>((set) => ({
  type: 'SPECTATOR',
  fullName: '',
  dni: '',
  email: '',
  reset: () => set({ type: 'SPECTATOR', fullName: '', email: '', dni: '' }),
}));

type CreateTicketModalProps = {
  eventName: string;
  eventId: string;
};

const CreateTicketModal = ({ eventName, eventId }: CreateTicketModalProps) => {
  const [open, setOpen] = useState(false);
  const [typeSelectOpen, setTypeSelectOpen] = useState(false);
  const modalData = useTicketModalData((state) => ({
    type: state.type,
    fullName: state.fullName,
    email: state.email,
    dni: state.dni,
    reset: state.reset,
  }));

  const createTicket = trpc.ticket.create.useMutation();
  const utils = trpc.useUtils();

  async function handleCancel() {
    setOpen(false);
    modalData.reset();
    createTicket.reset();
  }

  async function handleCreate() {
    await createTicket.mutateAsync({
      eventId,
      type: modalData.type,
      fullName: modalData.fullName,
      mail: modalData.email,
      dni: modalData.dni,
    });
    setOpen(false);
    modalData.reset();
    utils.ticket.getByEventId.invalidate(eventId);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className='absolute right-2 top-1/2 -translate-y-1/2'
          onClick={() => setOpen(true)}
        >
          Crear Ticket
        </Button>
      </DialogTrigger>
      <DialogContent
        onCloseAutoFocus={handleCancel}
        className='mx-2 flex w-full flex-col gap-y-3 rounded-md bg-slate-100 px-6 py-4 md:max-w-2xl'
      >
        <p className='w-fit py-1.5 text-base font-bold'>
          Crear ticket para {eventName}
        </p>
        <FormTextInput
          type='text'
          placeholder='María Perez'
          label='Nombre completo'
          onChange={(e) => {
            useTicketModalData.setState({
              fullName: e.target.value,
            });
          }}
        />
        <FormTextInput
          type='email'
          label='Correo electrónico'
          placeholder='mariaperez@gmail.com'
          onChange={(e) => {
            useTicketModalData.setState({
              email: e.target.value,
            });
          }}
        />
        <FormTextInput
          type='text'
          label='DNI'
          placeholder='12345678'
          onChange={(e) => {
            useTicketModalData.setState({
              dni: e.target.value,
            });
          }}
        />
        <Label className='slate-900 text-sm font-medium'>Tipo</Label>
        <Select
          open={typeSelectOpen}
          onOpenChange={setTypeSelectOpen}
          value={modalData.type}
          onValueChange={(value) => {
            useTicketModalData.setState({
              type: value as TicketModalData['type'],
            });
          }}
          defaultValue={modalData.type}
        >
          <SelectTrigger className='flex-1'>
            <SelectValue placeholder={iconsAndTexts[modalData.type].text} />
          </SelectTrigger>
          <SelectContent>
            {objectEntries(iconsAndTexts)
              .filter((entry) =>
                (['STAFF', 'SPECTATOR'] as TicketType[]).includes(entry[0])
              )
              .map(([key, { icon, text }]) => (
                <SelectItem key={key} value={key as TicketType}>
                  <div className='flex items-center gap-x-2'>
                    {icon}
                    <span>{text}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className='flex items-center justify-between'>
          <p className='text-sm font-bold text-red-500'>
            {createTicket.isError ? getErrorMessage(createTicket.error) : ''}
          </p>
          <div className='flex gap-x-2'>
            <Button
              className='bg-red-500 hover:bg-red-600'
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button disabled={createTicket.isLoading} onClick={handleCreate}>
              Crear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketModal;
