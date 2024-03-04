'use client';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { create } from 'zustand';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { trpc } from '@/lib/trpc';
import { LockIcon, UnlockIcon } from 'lucide-react';
import ColorPicker from './ColorPicker';

type GrupoEtiquetaModalData = {
  tipo: 'CREATE' | 'EDIT';
  nombre: string;
  grupoId: string;
  color: string;
  esExclusivo: boolean;
};

export const useGrupoEtiquetaModalData = create<GrupoEtiquetaModalData>(() => ({
  tipo: 'CREATE',
  nombre: '',
  grupoId: '',
  color: '',
  esExclusivo: false,
}));

export default function GrupoEtiquetaModal() {
  const [open, setOpen] = useState(false);
  const grupoEtiquetaCreate = trpc.grupoEtiqueta.create.useMutation();
  const grupoEtiquetaEdit = trpc.grupoEtiqueta.edit.useMutation();
  const modalData = useGrupoEtiquetaModalData((state) => ({
    tipo: state.tipo,
    nombre: state.nombre,
    grupoId: state.grupoId,
    color: state.color,
    esExclusivo: state.esExclusivo,
  }));

  async function handleCancel() {
    useGrupoEtiquetaModalData.setState({
      tipo: 'CREATE',
      nombre: '',
      grupoId: '',
      color: '',
      esExclusivo: false,
    });
  }

  async function handleSubmit() {
    if (useGrupoEtiquetaModalData.getState().tipo === 'CREATE') {
      await grupoEtiquetaCreate
        .mutateAsync({
          nombre: useGrupoEtiquetaModalData.getState().nombre,
          color: useGrupoEtiquetaModalData.getState().color,
          esExclusivo: useGrupoEtiquetaModalData.getState().esExclusivo,
        })
        .then(() => setOpen(!open))
        .catch(() => setOpen(open));
    } else {
      await grupoEtiquetaEdit
        .mutateAsync({
          id: useGrupoEtiquetaModalData.getState().grupoId,
          nombre: useGrupoEtiquetaModalData.getState().nombre,
          color: useGrupoEtiquetaModalData.getState().color,
          esExclusivo: useGrupoEtiquetaModalData.getState().esExclusivo,
        })
        .then(() => setOpen(!open))
        .catch(() => setOpen(open));
    }
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger className='rounded-md bg-gray-400 px-10 py-3 text-black hover:bg-gray-300'>
          Grupo de etiquetas
        </AlertDialogTrigger>
        <AlertDialogContent className='flex flex-col gap-y-3 bg-gray-400'>
          <div className='flex flex-col gap-y-1'>
            <p className='w-fit rounded-md border border-black bg-gray-300 px-3 py-1.5 text-sm'>
              Nombre del grupo de etiquetas
            </p>
            <div className='flex items-center gap-x-2'>
              <Input
                type='text'
                name='grupo'
                id='grupo'
                placeholder='Nombre del grupo'
                value={useGrupoEtiquetaModalData.getState().nombre}
                onChange={(e) => {
                  useGrupoEtiquetaModalData.setState({
                    nombre: e.target.value,
                  });
                }}
              />
              <LockIcon
                onClick={() => {
                  useGrupoEtiquetaModalData.setState({
                    esExclusivo:
                      !useGrupoEtiquetaModalData.getState().esExclusivo,
                  });
                }}
                className={`${useGrupoEtiquetaModalData.getState().esExclusivo ? 'block' : 'hidden'} h-6 w-6 hover:cursor-pointer`}
              />
              <UnlockIcon
                onClick={() => {
                  useGrupoEtiquetaModalData.setState({
                    esExclusivo:
                      !useGrupoEtiquetaModalData.getState().esExclusivo,
                  });
                }}
                className={`${useGrupoEtiquetaModalData.getState().esExclusivo ? 'hidden' : 'block'} h-6 w-6 hover:cursor-pointer`}
              />
              <ColorPicker />
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            className='h-fit w-1/2 rounded-lg bg-green-500 px-10 py-1 text-black hover:bg-green-400'
          >
            {modalData.tipo === 'CREATE' ? 'Crear' : 'Editar'}
          </Button>
          <AlertDialogCancel
            onClick={handleCancel}
            className='absolute right-0 top-0 h-fit w-fit rounded-full bg-gray-300 text-[#212529]'
          >
            X
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
