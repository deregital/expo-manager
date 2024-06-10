import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

const CrearModeloModal = ({ open }: { open: boolean }) => {
  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent>
          <p>Crear modelo manualmente</p>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CrearModeloModal;
