'use client';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { create } from 'zustand';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import Loader from '../ui/loader';

interface TagProps {
  id: string;
  name: string;
  color?: string;
}

export const useTemplateSend = create<{
  open: boolean;
  tags: TagProps[];
  template: string;
  profiles: number;
  price: number;
}>(() => ({
  open: false,
  tags: [],
  template: '',
  profiles: 0,
  price: 0,
}));

const SendTemplateModal = () => {
  const templateData = useTemplateSend();
  const sendTemplate = trpc.message.sendMessageToTags.useMutation();
  async function handleSubmit() {
    const res = await sendTemplate.mutateAsync({
      templateName: templateData.template,
      tags: templateData.tags.map((et) => et.id),
    });
    if (res.success) {
      toast.success('Plantilla enviada correctamente');
      useTemplateSend.setState({
        open: false,
        template: '',
        tags: [],
        profiles: 0,
        price: 0,
      });
      return;
    } else {
      toast.error('Error al enviar la plantilla a las etiquetas seleccionadas');
      return;
    }
  }
  function close() {
    useTemplateSend.setState({ open: false });
  }
  return (
    <AlertDialog open={templateData.open}>
      <AlertDialogTrigger></AlertDialogTrigger>
      <AlertDialogContent>
        <h1 className='font-bold'>Enviar plantilla</h1>
        <p>
          ¿Estás seguro de que deseas enviar la plantilla{' '}
          {templateData.template ? templateData.template : '-'} a{' '}
          {templateData.profiles}{' '}
          {templateData.profiles !== 1 ? 'participantes' : 'participante'} a un
          valor de USD${templateData.price.toFixed(3)}?
        </p>
        <div className='flex items-center justify-end gap-x-2'>
          <button
            className='rounded-md bg-red-600 p-2 text-sm text-white'
            onClick={close}
          >
            Cancelar
          </button>
          <button
            className='flex items-center justify-center gap-x-2 rounded-md bg-black p-2 text-sm text-white'
            onClick={handleSubmit}
          >
            {sendTemplate.isLoading && (
              <Loader className='h-4 w-4 animate-spin fill-primary text-gray-200 dark:text-gray-600' />
            )}
            <p>Enviar</p>
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SendTemplateModal;
