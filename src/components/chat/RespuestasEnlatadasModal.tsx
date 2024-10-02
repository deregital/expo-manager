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

interface RespuestasEnlatadasModalProps {
  action: 'EDIT' | 'CREATE';
  respuestaEnlatada?: { id: string; nombre: string; descripcion: string };
}

type RespuestaEnlatadaModalData = {
  tipo: 'CREATE' | 'EDIT';
  id?: string;
  nombre: string;
  descripcion: string;
};

export const useRespuestasEnlatadasModalData =
  create<RespuestaEnlatadaModalData>(() => ({
    tipo: 'CREATE',
    nombre: '',
    descripcion: '',
  }));

const RespuestasEnlatadasModal = ({
  action,
  respuestaEnlatada,
}: RespuestasEnlatadasModalProps) => {
  const [open, setOpen] = useState(false);
  const modalData = useRespuestasEnlatadasModalData();
  const createRespuesta = trpc.respuestasEnlatadas.create.useMutation();
  const editRespuesta = trpc.respuestasEnlatadas.update.useMutation();
  const deleteRespuesta = trpc.respuestasEnlatadas.delete.useMutation();

  function onClose() {
    useRespuestasEnlatadasModalData.setState({
      tipo: 'CREATE',
      nombre: '',
      descripcion: '',
    });
    setOpen(false);
  }

  const handleSubmit = async () => {
    const { tipo, id, nombre, descripcion } =
      useRespuestasEnlatadasModalData.getState();
    if (tipo === 'CREATE') {
      await createRespuesta
        .mutateAsync({ nombre, descripcion })
        .then(() => {
          setOpen(false);
          onClose();
          toast.success('Respuesta enlatada creada con éxito');
        })
        .catch(() => toast.error('Error al crear la respuesta enlatada'));
    } else if (tipo === 'EDIT') {
      if (!id) return;
      await editRespuesta
        .mutateAsync({ id, nombre, descripcion })
        .then(() => {
          setOpen(false);
          onClose();
          toast.success('Respuesta enlatada editada con éxito');
        })
        .catch(() => toast.error('Error al editar la respuesta enlatada'));
    }
  };

  const handleDelete = async () => {
    if (respuestaEnlatada) {
      await deleteRespuesta
        .mutateAsync({ id: respuestaEnlatada.id })
        .then(() => {
          setOpen(false);
          onClose();
          toast.success('Respuesta enlatada eliminada con éxito');
        })
        .catch(() => toast.error('Error al eliminar la respuesta enlatada'));
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            onClose();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            className='mx-3'
            onClick={() => {
              setOpen(true);
              useRespuestasEnlatadasModalData.setState({
                tipo: action,
                id: respuestaEnlatada?.id || '',
                nombre: respuestaEnlatada?.nombre || '',
                descripcion: respuestaEnlatada?.descripcion || '',
              });
            }}
          >
            {action === 'CREATE' ? 'Crear Respuesta enlatada' : 'Editar '}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>
            {action === 'CREATE' ? 'Crear Respuesta enlatada' : 'Editar'}
          </DialogTitle>
          <Input
            placeholder='Nombre'
            value={modalData.nombre}
            onChange={(e) =>
              useRespuestasEnlatadasModalData.setState({
                nombre: e.target.value,
              })
            }
          />
          <Input
            placeholder='Descripción'
            value={modalData.descripcion}
            onChange={(e) =>
              useRespuestasEnlatadasModalData.setState({
                descripcion: e.target.value,
              })
            }
          />
          <Button onClick={handleSubmit}>
            {createRespuesta.isLoading || editRespuesta.isLoading ? (
              <Loader />
            ) : action === 'CREATE' ? (
              'Crear'
            ) : (
              'Editar'
            )}
          </Button>
          {action === 'EDIT' && respuestaEnlatada && (
            <Button variant='destructive' onClick={handleDelete}>
              Eliminar
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RespuestasEnlatadasModal;
