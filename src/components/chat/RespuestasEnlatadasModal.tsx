'use client';
import { useState } from 'react';
import { create } from 'zustand';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Loader from '@/components/ui/loader';

interface RespuestasEnlatadasModalProps {
  action: 'EDIT' | 'CREATE';
  respuestaEnlatada?: { id: string; nombre: string; descripcion: string };
  onClose: () => void;
}

type RespuestaEnlatadaModalData = {
  [x: string]: any;
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
  onClose,
}: RespuestasEnlatadasModalProps) => {
  const [open, setOpen] = useState(false);
  const modalData = useRespuestasEnlatadasModalData();
  const createRespuesta = trpc.respuestasEnlatadas.create.useMutation();
  const editRespuesta = trpc.respuestasEnlatadas.update.useMutation();
  const deleteRespuesta = trpc.respuestasEnlatadas.delete.useMutation();

  const handleSubmit = async () => {
    const { tipo, id, nombre, descripcion } = modalData.getState();
    if (tipo === 'CREATE') {
      await createRespuesta
        .mutateAsync({ nombre, descripcion })
        .then(() => {
          setOpen(false);
          onClose(); // Llama a onClose al cerrar el modal
          toast.success('Respuesta enlatada creada con éxito');
        })
        .catch(() => toast.error('Error al crear la respuesta enlatada'));
    } else if (tipo === 'EDIT') {
      await editRespuesta
        .mutateAsync({ id, nombre, descripcion })
        .then(() => {
          setOpen(false);
          onClose(); // Llama a onClose al cerrar el modal
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
          onClose(); // Llama a onClose al cerrar el modal
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
            onClose(); // Llama a onClose si se cierra el modal
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              setOpen(true);
              modalData.setState({
                tipo: action,
                id: respuestaEnlatada?.id || '',
                nombre: respuestaEnlatada?.nombre || '',
                descripcion: respuestaEnlatada?.descripcion || '',
              });
            }}
          >
            {action === 'CREATE' ? 'Crear Respuesta' : 'Editar Respuesta'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Input
            placeholder='Nombre'
            value={modalData.getState().nombre}
            onChange={(e) => modalData.setState({ nombre: e.target.value })}
          />
          <Input
            placeholder='Descripción'
            value={modalData.getState().descripcion}
            onChange={(e) =>
              modalData.setState({ descripcion: e.target.value })
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
