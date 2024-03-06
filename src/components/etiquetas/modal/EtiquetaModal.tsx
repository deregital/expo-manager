'use client';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ComboBox from './GrupoEtiquetaComboBox';
import { useState } from 'react';
import { create } from 'zustand';
import { Button } from '@/components/ui/button';
import { Etiqueta } from '@prisma/client';
import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import ModalTrigger, {
  ModalTriggerCreate,
  ModalTriggerEdit,
} from '@/components/etiquetas/modal/ModalTrigger';
import EditFillIcon from '@/components/icons/EditFillIcon';

interface EtiquetaModalProps {
  action: 'CREATE' | 'EDIT';
  etiqueta?: Omit<Etiqueta, 'created_at' | 'updated_at'>;
}

type ModalData = {
  tipo: 'CREATE' | 'EDIT';
  grupoId: string;
  nombre: string;
  etiquetaId: string;
};
export const useEtiquetaModalData = create<ModalData>(() => ({
  tipo: 'CREATE',
  grupoId: '',
  nombre: '',
  etiquetaId: '',
}));

const EtiquetaModal = ({ action, etiqueta }: EtiquetaModalProps) => {
  const { data: getGrupoEtiquetas, isLoading } =
    trpc.grupoEtiqueta.getAll.useQuery();
  const utils = trpc.useUtils();
  const modalData = useEtiquetaModalData((state) => ({
    tipo: state.tipo,
    nombre: state.nombre,
  }));
  const [open, setOpen] = useState(false);
  const createEtiqueta = trpc.etiqueta.create.useMutation();
  const editEtiqueta = trpc.etiqueta.edit.useMutation();

  async function sendEtiqueta() {
    if (modalData.tipo === 'CREATE') {
      await createEtiqueta
        .mutateAsync({
          nombre: modalData.nombre,
          grupoId: useEtiquetaModalData.getState().grupoId,
        })
        .then(() => setOpen(!open))
        .catch((error) => console.log(error));
    } else if (modalData.tipo === 'EDIT') {
      await editEtiqueta
        .mutateAsync({
          id: useEtiquetaModalData.getState().etiquetaId,
          nombre: modalData.nombre,
          grupoId: useEtiquetaModalData.getState().grupoId,
        })
        .then(() => setOpen(!open))
        .catch((error) => console.log(error));
    }
    useEtiquetaModalData.setState({
      tipo: 'CREATE',
      grupoId: '',
      nombre: '',
      etiquetaId: '',
    });

    utils.etiqueta.getByNombre.invalidate();
  }

  async function handleCancel() {
    useEtiquetaModalData.setState({
      tipo: 'CREATE',
      grupoId: '',
      nombre: '',
      etiquetaId: '',
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <ModalTrigger action={action}>
            <ModalTriggerCreate
              onClick={() => {
                setOpen(true);
                useEtiquetaModalData.setState({
                  tipo: 'CREATE',
                  nombre: '',
                  grupoId: '',
                  etiquetaId: '',
                });
              }}
            >
              <span>
                <EtiquetaFillIcon className='mr-3 h-6 w-6' />
              </span>
              Crear etiqueta
            </ModalTriggerCreate>
            <ModalTriggerEdit
              onClick={(e) => {
                e.preventDefault();
                setOpen(true);
                useEtiquetaModalData.setState({
                  tipo: 'EDIT',
                  etiquetaId: etiqueta?.id ?? '',
                  nombre: etiqueta?.nombre ?? '',
                  grupoId: etiqueta?.grupoId ?? '',
                });
              }}
            >
              <EditFillIcon />
            </ModalTriggerEdit>
          </ModalTrigger>
        </DialogTrigger>
        <DialogContent
          onCloseAutoFocus={handleCancel}
          className='flex w-full flex-col gap-y-3 rounded-md bg-gray-400 p-10'
        >
          <div className='flex flex-col gap-y-0.5'>
            <p className='w-fit rounded-lg bg-gray-300 px-3 py-1.5 text-base font-semibold'>
              Nombre de la etiqueta
            </p>
            <div className='flex gap-x-3'>
              <Input
                className='bg-white text-black'
                type='text'
                name='etiqueta'
                id='etiqueta'
                placeholder='Nombre de la etiqueta'
                value={modalData.nombre}
                onChange={(e) =>
                  useEtiquetaModalData.setState({ nombre: e.target.value })
                }
              />
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <ComboBox data={getGrupoEtiquetas ?? []} />
              )}
            </div>
          </div>
          <div className='flex items-center justify-start gap-3'>
            <Button
              className='h-fit rounded-lg bg-green-300 px-20 py-1 text-black/80 hover:bg-green-400'
              onClick={sendEtiqueta}
            >
              {modalData.tipo === 'CREATE' ? 'Crear' : 'Editar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EtiquetaModal;
