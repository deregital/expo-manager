'use client';
import { trpc } from '@/lib/trpc';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import ComboBox from './ComboBox';
import { useState } from 'react';
import { create } from 'zustand';
import { Button } from './ui/button';

type ModalData = {
  tipo: 'CREATE' | 'EDIT';
  grupoId: string;
  nombre: string;
  etiquetaId: string;
};
export const useModalData = create<ModalData>(() => ({
  tipo: 'EDIT',
  grupoId: '18958be2-fc07-40a1-88e3-424176f6bb2e',
  nombre: 'hola',
  etiquetaId: 'cd844b57-4de8-4a2f-a5fc-87f765e63f2d',
}));

export default function EtiquetaModal() {
  const { data: getGrupoEtiquetas, isLoading } =
    trpc.grupoEtiqueta.getAll.useQuery();
  const modalData = useModalData((state) => ({
    tipo: state.tipo,
    nombre: state.nombre,
  }));
  const [value, setValue] = useState(
    modalData.tipo === 'CREATE' ? '' : modalData.nombre
  );
  const [open, setOpen] = useState(false);
  const createEtiqueta = trpc.etiqueta.create.useMutation();
  const editEtiqueta = trpc.etiqueta.edit.useMutation();

  async function sendEtiqueta() {
    setValue('');
    if (modalData.tipo === 'CREATE') {
      await createEtiqueta
        .mutateAsync({
          nombre: value,
          grupoId: useModalData.getState().grupoId,
        })
        .then((response) => setOpen(!open))
        .catch((error) => console.log(error));
    } else {
      await editEtiqueta
        .mutateAsync({
          id: useModalData.getState().etiquetaId,
          nombre: value,
          grupoId: useModalData.getState().grupoId,
        })
        .then((response) => setOpen(!open))
        .catch((error) => console.log(error));
    }
    useModalData.setState({
      tipo: 'CREATE',
      grupoId: '',
      nombre: '',
      etiquetaId: '',
    });
  }

  async function handleCancel() {
    setValue('');
    useModalData.setState({
      tipo: 'CREATE',
      grupoId: '',
      nombre: '',
      etiquetaId: '',
    });
  }
  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="flex w-full flex-col gap-y-3 rounded-md bg-gray-400 p-10">
          <div className="flex flex-col gap-y-0.5">
            <p className="w-fit rounded-lg bg-gray-300 px-3 py-1.5 text-base font-semibold">
              Nombre de la etiqueta
            </p>
            <div className="flex gap-x-3">
              <Input
                className="bg-white text-black"
                type="text"
                name="etiqueta"
                id="etiqueta"
                placeholder="Nombre de la etiqueta"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <ComboBox data={getGrupoEtiquetas ?? []} />
              )}
            </div>
          </div>
          <div className="flex items-center justify-start gap-3">
            <Button
              className="h-fit rounded-lg bg-green-300 px-20 py-1 text-black/80 hover:bg-green-400"
              onClick={sendEtiqueta}
            >
              {modalData.tipo === 'CREATE' ? 'Crear' : 'Editar'}
            </Button>
            <AlertDialogCancel
              onClick={handleCancel}
              className="absolute right-0 top-0 h-fit w-fit rounded-full text-[#212529]"
            >
              X
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
