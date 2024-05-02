import { ModalTriggerEdit } from '@/components/etiquetas/modal/ModalTrigger';
import EditFillIcon from '@/components/icons/EditFillIcon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

interface ModeloEditModalProps {
  modelo: NonNullable<RouterOutputs['modelo']['getById']>;
}

interface ModeloModalData {
  open: boolean;
  genero: string;
  edad: string;
}

const useModeloModalData = create<ModeloModalData>(() => ({
  open: false,
  genero: 'N/A',
  edad: 'N/A',
}));

const ModeloEditModal = ({ modelo }: ModeloEditModalProps) => {
  const { open, genero, edad } = useModeloModalData();
  const [openSelect, setOpenSelect] = useState(false);
  const utils = trpc.useUtils();

  const editModelo = trpc.modelo.edit.useMutation({
    onSuccess: () => {
      toast.success('Modelo editado con éxito');
      useModeloModalData.setState({
        genero: 'N/A',
        edad: 'N/A',
        open: false,
      });
      setOpenSelect(false);
      utils.modelo.getById.invalidate(modelo.id);
    },
  });

  async function edit() {
    const edadnum = parseInt(edad);

    if (!genero || !edadnum) {
      return;
    }

    return await editModelo.mutateAsync({
      id: modelo.id,
      genero,
      edad: edadnum,
    });
  }

  async function handleCancel() {
    useModeloModalData.setState({
      genero: 'N/A',
      edad: 'N/A',
      open: false,
    });
    setOpenSelect(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        useModeloModalData.setState({
          open: value,
        });
      }}
    >
      <DialogTrigger>
        <ModalTriggerEdit
          onClick={(e) => {
            e.preventDefault();
            useModeloModalData.setState({
              open: true,
              genero: modelo.genero ?? 'N/A',
              edad: modelo.edad?.toString() ?? 'N/A',
            });
          }}
        >
          <EditFillIcon />
        </ModalTriggerEdit>
      </DialogTrigger>
      <DialogContent
        onCloseAutoFocus={handleCancel}
        className='flex w-full flex-col gap-y-3 rounded-md bg-slate-100 px-5 py-3 md:mx-auto md:max-w-2xl'
      >
        <div className='flex flex-col gap-y-0.5'>
          <p className='w-fit py-1.5 text-base font-semibold'>Editar modelo</p>
          <div className='flex gap-x-3'>
            <div>
              <Label htmlFor='genero'>Genero</Label>
              <Select
                open={openSelect}
                onOpenChange={setOpenSelect}
                onValueChange={(value) => {
                  useModeloModalData.setState({
                    genero: value as string,
                  });
                }}
                defaultValue={modelo.genero ?? 'N/A'}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Genero' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Femenino'>Femenino</SelectItem>
                  <SelectItem value='Masculino'>Masculino</SelectItem>
                  <SelectItem value='Otro'>Otro</SelectItem>
                  <SelectItem value='N/A'>N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='edad'>Edad</Label>
              <Input
                className='bg-white text-black'
                type='text'
                inputMode='numeric'
                autoComplete='off'
                pattern='[0-9]*'
                name='edad'
                id='edad'
                placeholder='Edad'
                value={isNaN(parseInt(edad)) ? '' : edad}
                onChange={(e) => {
                  useModeloModalData.setState({
                    edad: parseInt(e.target.value).toString(),
                  });
                }}
              />
            </div>
          </div>
        </div>
        {editModelo.isError ? (
          <p className='text-sm font-semibold text-red-500'>
            Error al editar la modelo, asegúrese de poner un genero y asignarle
            una edad
          </p>
        ) : null}
        <div className='flex gap-x-4'>
          <Button
            className='w-full max-w-32'
            onClick={edit}
            disabled={editModelo.isLoading}
          >
            {(editModelo.isLoading && <Loader />) || 'Editar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModeloEditModal;
