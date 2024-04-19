'use client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { create } from 'zustand';
import { GetTemplatesData } from '@/server/types/whatsapp';
import Loader from '../ui/loader';

export const useTemplateDelete = create<{
  open: boolean;
  plantilla: GetTemplatesData | null;
}>((set) => ({
  open: false,
  plantilla: null,
}));

const DeleteTemplateModal = ({
  open,
  plantilla,
}: {
  open: boolean;
  plantilla: GetTemplatesData | null;
}) => {
  const deleteTemplate = trpc.whatsapp.deleteTemplate.useMutation();
  const utils = trpc.useUtils();
  async function handleDelete() {
    await deleteTemplate
      .mutateAsync({
        titulo: plantilla ? plantilla.name : '',
      })
      .then(() => {
        useTemplateDelete.setState({ open: false, plantilla: null });
        toast.success('Plantilla eliminada');
        utils.whatsapp.getTemplates.invalidate();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }
  function close() {
    // useTemplateDelete.setState({open: false, plantilla: null})
    useTemplateDelete.setState({ open: false, plantilla: null });
  }
  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger></AlertDialogTrigger>
      <AlertDialogContent>
        <h1 className='font-bold'>Eliminar plantilla</h1>
        <p>
          ¿Estás seguro de que deseas eliminar la plantilla{' '}
          {plantilla ? plantilla.name : '-'}?
        </p>
        <div className='flex items-center justify-end gap-x-2'>
          <button
            className='rounded-md bg-black p-2 text-sm text-white'
            onClick={close}
          >
            Cancelar
          </button>
          <button
            className='flex items-center justify-center gap-x-2 rounded-md bg-red-600 p-2 text-sm text-white'
            onClick={handleDelete}
          >
            {deleteTemplate.isLoading && (
              <Loader className='h-4 w-4 animate-spin fill-primary text-gray-200 dark:text-gray-600' />
            )}
            <p>Eliminar</p>
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTemplateModal;