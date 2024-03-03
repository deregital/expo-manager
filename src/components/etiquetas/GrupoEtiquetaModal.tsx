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

  async function handleCancel() {
    useGrupoEtiquetaModalData.setState({
      tipo: 'CREATE',
      nombre: '',
      grupoId: '',
      color: '',
      esExclusivo: false,
    });
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
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
              />
            </div>
          </div>
          <Button className='h-fit w-1/2 rounded-lg bg-green-500 px-10 py-1 text-black hover:bg-green-400'>
            Guardar
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
