'use client';
import { useState } from 'react';
import { create } from 'zustand';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { LockIcon, UnlockIcon } from 'lucide-react';
import ColorPicker from '@/components/ui/ColorPicker';
import { hsvaToHex } from '@uiw/color-convert';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import EditFillIcon from '@/components/icons/EditFillIcon';
import { EtiquetaGrupo } from '@prisma/client';

interface GrupoEtiquetaModalProps {
  action: 'EDIT' | 'CREATE';
  grupo?: Omit<EtiquetaGrupo, 'created_at' | 'updated_at'>;
}

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

const GrupoEtiquetaModal = ({ action, grupo }: GrupoEtiquetaModalProps) => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
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
      color: `${hsvaToHex({ h: 0, s: 0, v: 68, a: 1 })}`,
      esExclusivo: false,
    });
  }

  async function handleSubmit() {
    const { tipo, nombre, grupoId, color, esExclusivo } =
      useGrupoEtiquetaModalData.getState();
    if (tipo === 'CREATE') {
      await grupoEtiquetaCreate
        .mutateAsync({
          nombre: nombre,
          color: color,
          esExclusivo: esExclusivo,
        })
        .then(() => {
          setOpen(false);
        })
        .catch(() => setOpen(true));
    } else {
      await grupoEtiquetaEdit
        .mutateAsync({
          id: grupoId,
          nombre: nombre,
          color: color,
          esExclusivo: esExclusivo,
        })
        .then(() => setOpen(false))
        .catch(() => setOpen(true));
    }
    useGrupoEtiquetaModalData.setState({
      tipo: 'CREATE',
      nombre: '',
      grupoId: '',
      color: `${hsvaToHex({ h: 0, s: 0, v: 68, a: 1 })}`,
      esExclusivo: false,
    });

    utils.etiqueta.getByNombre.invalidate();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {action === 'CREATE' ? (
            <Button
              className='rounded-md bg-gray-400 px-5 py-0.5 text-gray-950 hover:bg-gray-300'
              onClick={() => {
                setOpen(true);
                useGrupoEtiquetaModalData.setState({
                  tipo: 'CREATE',
                  nombre: '',
                  grupoId: '',
                  color: `${hsvaToHex({ h: 0, s: 0, v: 68, a: 1 })}`,
                  esExclusivo: false,
                });
              }}
            >
              <span>
                <EtiquetasFillIcon className='mr-3 h-6 w-6' />
              </span>
              Crear grupo de etiquetas
            </Button>
          ) : (
            <div
              onClick={(e) => {
                e.preventDefault();
                setOpen(true);
                useGrupoEtiquetaModalData.setState({
                  tipo: 'EDIT',
                  grupoId: grupo?.id ?? '',
                  nombre: grupo?.nombre ?? '',
                  color: grupo?.color ?? '',
                  esExclusivo: grupo?.esExclusivo ?? false,
                });
              }}
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                }),
                'flex h-fit items-center rounded-full p-0.5'
              )}
            >
              <EditFillIcon />
            </div>
          )}
        </DialogTrigger>
        <DialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            setOpen(false);
            handleCancel();
          }}
          className='flex flex-col gap-y-3 bg-gray-400'
        >
          <div className='flex flex-col gap-y-1'>
            <p className='w-fit rounded-md border border-black bg-gray-300 px-3 py-1.5 text-sm'>
              Nombre del grupo de etiquetas
            </p>
            <div className='relative flex items-center gap-x-2'>
              <Input
                type='text'
                name='grupo'
                id='grupo'
                placeholder='Nombre del grupo'
                value={modalData.nombre}
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
                className={cn('h-6 w-6 hover:cursor-pointer', {
                  block: modalData.esExclusivo,
                  hidden: !modalData.esExclusivo,
                })}
              />
              <UnlockIcon
                onClick={() => {
                  useGrupoEtiquetaModalData.setState({
                    esExclusivo:
                      !useGrupoEtiquetaModalData.getState().esExclusivo,
                  });
                }}
                className={cn('h-6 w-6 hover:cursor-pointer', {
                  hidden: useGrupoEtiquetaModalData.getState().esExclusivo,
                  block: !useGrupoEtiquetaModalData.getState().esExclusivo,
                })}
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GrupoEtiquetaModal;
