import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import React from 'react';
import { toast } from 'sonner';

interface BotonesPapeleraProps {
  esPapelera: boolean;
  id: string;
}

const BotonesPapelera = ({ esPapelera, id }: BotonesPapeleraProps) => {
  const utils = trpc.useUtils();

  const removeFromTrashMutation = trpc.modelo.edit.useMutation({
    onSuccess: () => {
      toast.success('Participante restaurado');
      utils.modelo.getById.invalidate();
    },
    onError: () => {
      toast.error('Error al borrar el participante de la papelera');
    },
  });

  const sendToTrashMutation = trpc.modelo.edit.useMutation({
    onSuccess: () => {
      toast.success('Participante enviado a la papelera');
      utils.modelo.getById.invalidate();
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

  async function handleRemoveFromTrash() {
    try {
      if (!esPapelera) {
        toast.info('Este Participante no está en la papelera');
        return;
      }

      await removeFromTrashMutation.mutateAsync({
        id: id,
        esPapelera: false,
        fechaPapelera: null,
      });
    } catch (error) {}
  }

  return (
    <>
      {esPapelera ? (
        <>
          <Button
            className='mr-2 mt-2 bg-red-800 px-2 py-1 text-sm hover:bg-red-900'
            onClick={handleRemoveFromTrash}
          >
            Restaurar
          </Button>
          <Button
            className='mt-2 bg-red-800 px-2 py-1 text-sm hover:bg-red-900'
            onClick={handleDeletePermanently}
          >
            Eliminar Definitivamente
          </Button>
        </>
      ) : (
        <Button
          className={`mt-2 bg-red-600 px-2 py-1 text-sm hover:bg-red-800`}
          onClick={handleSendToTrash}
        >
          Enviar a la Papelera
        </Button>
      )}
    </>
  );
};

export default BotonesPapelera;
