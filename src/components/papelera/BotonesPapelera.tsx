import PapeleraIcon from '@/components/icons/PapeleraIcon';
import RestoreIcon from '@/components/icons/RestoreIcon';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import React from 'react';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';

interface BotonesPapeleraProps {
  esPapelera: boolean;
  id: string;
}

const BotonesPapelera = ({ esPapelera, id }: BotonesPapeleraProps) => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const pathname = usePathname();

  const agregarComentarioMutation = trpc.comentario.create.useMutation({
    onError: () => {
      toast.error('Error al agregar comentario');
    },
  });

  const restoreMutation = trpc.modelo.edit.useMutation({
    onSuccess: async () => {
      await agregarComentarioMutation.mutateAsync({
        perfilId: id,
        contenido: 'Participante restaurada de la papelera',
      });
      toast.success('Participante restaurada de la papelera');
      utils.modelo.getById.invalidate();
      utils.modelo.getModelosPapelera.invalidate();
      utils.comentario.getByPerfilId.invalidate({ perfilId: id });
    },
    onError: () => {
      toast.error('Error al restaurar el participante de la papelera');
    },
  });

  const sendToTrashMutation = trpc.modelo.edit.useMutation({
    onSuccess: async () => {
      await agregarComentarioMutation.mutateAsync({
        perfilId: id,
        contenido: 'Participante enviada a la papelera',
      });
      toast.success('Participante enviada la papelera');
      utils.modelo.getById.invalidate();
      utils.modelo.getModelosPapelera.invalidate();
      utils.comentario.getByPerfilId.invalidate({ perfilId: id });
    },
    onError: () => {
      toast.error('Error al enviar el participante a la papelera');
    },
  });

  const deleteMutation = trpc.modelo.delete.useMutation({
    onSuccess: () => {
      toast.success('Participante eliminado definitivamente');
      utils.modelo.getModelosPapelera.invalidate();
      utils.modelo.getById.invalidate();

      if (pathname !== '/papelera') {
        router.replace('/modelos');
      }
    },
    onError: () => {
      toast.error('Error al eliminar el participante definitivamente');
    },
  });

  async function handleSendToTrash() {
    try {
      if (esPapelera) {
        toast.info('Este Participante ya fue agregado a la papelera');
        return;
      }
      await sendToTrashMutation.mutateAsync({
        id: id,
        esPapelera: true,
        fechaPapelera: new Date().toISOString(),
      });
    } catch (error) {}
  }

  async function handleDeletePermanently() {
    try {
      if (!esPapelera) {
        toast.info(
          'El participante debe estar en la papelera para eliminarlo definitivamente'
        );
        return;
      }
      await deleteMutation.mutateAsync(id);
    } catch (error) {}
  }

  async function handleRestoreFromTrash() {
    try {
      if (!esPapelera) {
        toast.info('Este Participante no está en la papelera');
        return;
      }

      await restoreMutation.mutateAsync({
        id: id,
        esPapelera: false,
        fechaPapelera: null,
      });
    } catch (error) {}
  }

  return (
    <>
      {esPapelera ? (
        <div className='flex gap-x-4'>
          <Button
            disabled={restoreMutation.isLoading || deleteMutation.isLoading}
            title='Restaurar'
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              await handleRestoreFromTrash();
            }}
            className='aspect-square bg-green-900 p-1.5 hover:bg-green-800'
          >
            <RestoreIcon className='size-full' />
          </Button>
          <Button
            title='Eliminar definitivamente'
            disabled={restoreMutation.isLoading || deleteMutation.isLoading}
            variant={'destructive'}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              await handleDeletePermanently();
            }}
            className='aspect-square p-1.5'
          >
            <PapeleraIcon className='size-full' />
          </Button>
        </div>
      ) : (
        <Button
          className={'mt-2 bg-red-600 px-2 py-1 text-sm hover:bg-red-800'}
          onClick={handleSendToTrash}
          disabled={sendToTrashMutation.isLoading}
        >
          Enviar a la Papelera
        </Button>
      )}
    </>
  );
};

export default BotonesPapelera;
