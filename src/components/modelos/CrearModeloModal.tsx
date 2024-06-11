'use client';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { useCrearModeloModal } from './CrearModelo';

const CrearModeloModal = ({ open }: { open: boolean }) => {
  const modalModelo = useCrearModeloModal();
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={() =>
          useCrearModeloModal.setState({ open: !modalModelo.open })
        }
      >
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <p>Crear modelo manualmente</p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CrearModeloModal;
