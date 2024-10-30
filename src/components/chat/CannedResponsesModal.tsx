'use client';
import { useState } from 'react';
import { create } from 'zustand';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Loader from '@/components/ui/loader';
import { Label } from '@/components/ui/label';
import EditFillIcon from '@/components/icons/EditFillIcon';

interface CannedResponsesModalProps {
  action: 'EDIT' | 'CREATE';
  cannedResponse?: { id: string; name: string; content: string };
}

type CannedResponseModalData = {
  type: 'CREATE' | 'EDIT';
  id?: string;
  name: string;
  content: string;
};

export const useCannedResponsesModalData = create<CannedResponseModalData>(
  () => ({
    type: 'CREATE',
    name: '',
    content: '',
  })
);

const CannedResponsesModal = ({
  action,
  cannedResponse,
}: CannedResponsesModalProps) => {
  const [open, setOpen] = useState(false);
  const modalData = useCannedResponsesModalData();
  const createResponse = trpc.cannedResponse.create.useMutation();
  const editResponse = trpc.cannedResponse.update.useMutation();
  const deleteResponse = trpc.cannedResponse.delete.useMutation();
  const utils = trpc.useUtils();

  function onClose() {
    useCannedResponsesModalData.setState({
      type: 'CREATE',
      name: '',
      content: '',
    });
    setOpen(false);
  }

  const handleSubmit = async () => {
    const { type, id, name, content } = useCannedResponsesModalData.getState();
    if (type === 'CREATE') {
      await createResponse
        .mutateAsync({ name, content })
        .then(() => {
          setOpen(false);
          onClose();
          toast.success('Respuesta enlatada creada con éxito');
          utils.cannedResponse.getAll.invalidate();
        })
        .catch((e) => {
          const errorMessage = JSON.parse(e.message)[0].message;

          toast.error(errorMessage);
        });
    } else if (type === 'EDIT') {
      if (!id) return;
      await editResponse
        .mutateAsync({ id, name, content })
        .then(() => {
          setOpen(false);
          onClose();
          toast.success('Respuesta enlatada editada con éxito');
          utils.cannedResponse.getAll.invalidate();
        })
        .catch((e) => {
          const errorMessage = JSON.parse(e.message)[0].message;

          toast.error(errorMessage);
        });
    }
  };

  const handleDelete = async () => {
    if (cannedResponse) {
      await deleteResponse
        .mutateAsync(cannedResponse.id)
        .then(() => {
          setOpen(false);
          onClose();
          toast.success('Respuesta enlatada eliminada con éxito');
          utils.cannedResponse.getAll.invalidate();
        })
        .catch((e) => {
          const errorMessage = JSON.parse(e.message)[0].message;

          toast.error(errorMessage);
        });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();

              setOpen(true);
              useCannedResponsesModalData.setState({
                type: action,
                id: cannedResponse?.id || '',
                name: cannedResponse?.name || '',
                content: cannedResponse?.content || '',
              });
            }}
          >
            {action === 'CREATE' ? (
              'Crear Respuesta enlatada'
            ) : (
              <EditFillIcon />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <DialogTitle>
            {action === 'CREATE' ? 'Crear Respuesta enlatada' : 'Editar'}
          </DialogTitle>
          <Label>Nombre</Label>
          <Input
            placeholder='Nombre'
            value={modalData.name}
            onChange={(e) => {
              e.stopPropagation();
              e.preventDefault();
              useCannedResponsesModalData.setState({
                name: e.target.value,
              });
            }}
          />
          <Label>Texto</Label>
          <Input
            placeholder='Texto'
            value={modalData.content}
            onChange={(e) =>
              useCannedResponsesModalData.setState({
                content: e.target.value,
              })
            }
          />
          <Button onClick={handleSubmit}>
            {createResponse.isLoading || editResponse.isLoading ? (
              <Loader />
            ) : action === 'CREATE' ? (
              'Crear'
            ) : (
              'Editar'
            )}
          </Button>
          {action === 'EDIT' && cannedResponse && (
            <Button variant='destructive' onClick={handleDelete}>
              Eliminar
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CannedResponsesModal;
