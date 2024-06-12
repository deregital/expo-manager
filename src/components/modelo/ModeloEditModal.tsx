import { ModalTriggerEdit } from '@/components/etiquetas/modal/ModalTrigger';
import CirclePlus from '@/components/icons/CirclePlus';
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
import { differenceInYears } from 'date-fns';
import { TrashIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

interface ModeloEditModalProps {
  modelo: NonNullable<RouterOutputs['modelo']['getById']>;
}

interface ModeloModalData {
  open: boolean;
  genero: string;
  fechaNacimiento: Date | undefined;
  nombresAlternativos: string[];
  instagram: string | undefined;
  mail: string | undefined;
  dni: string | undefined;
  telefono: string | undefined;
  nombreCompleto: string | undefined;
}

export function edadFromFechaNacimiento(fechaNacimiento: string) {
  return differenceInYears(new Date(), new Date(fechaNacimiento));
}

const useModeloModalData = create<ModeloModalData>(() => ({
  open: false,
  genero: 'N/A',
  fechaNacimiento: undefined,
  nombresAlternativos: [],
  instagram: undefined,
  mail: undefined,
  dni: undefined,
  telefono: undefined,
  nombreCompleto: undefined,
}));

const ModeloEditModal = ({ modelo }: ModeloEditModalProps) => {
  const {
    open,
    genero,
    fechaNacimiento,
    nombresAlternativos,
    instagram,
    mail,
    dni,
    telefono,
    nombreCompleto,
  } = useModeloModalData();
  const [openSelect, setOpenSelect] = useState(false);
  const [error, setError] = useState('');
  const utils = trpc.useUtils();

  useEffect(() => {
    useModeloModalData.setState({
      fechaNacimiento: modelo.fechaNacimiento
        ? new Date(modelo.fechaNacimiento)
        : undefined,
      nombresAlternativos: modelo.nombresAlternativos,
      instagram: modelo.instagram ?? undefined,
      mail: modelo.mail ?? undefined,
      dni: modelo.dni ?? undefined,
      telefono: modelo.telefono ?? undefined,
      nombreCompleto: modelo.nombreCompleto ?? undefined,
    });
  }, [
    modelo.fechaNacimiento,
    modelo.nombresAlternativos,
    modelo.instagram,
    modelo.mail,
    modelo.dni,
    modelo.telefono,
    modelo.nombreCompleto,
  ]);

  const editModelo = trpc.modelo.edit.useMutation({
    onSuccess: () => {
      toast.success('Modelo editado con éxito');
      useModeloModalData.setState({
        genero: modelo.genero ?? 'N/A',
        fechaNacimiento: modelo.fechaNacimiento
          ? new Date(modelo.fechaNacimiento)
          : undefined,
        open: false,
      });
      setOpenSelect(false);
      setError('');
      utils.modelo.getById.invalidate(modelo.id);
    },
    onError: (error) => {
      const errorCode = error.data?.code;
      if (errorCode === 'CONFLICT') {
        setError('Ya existe un modelo con ese teléfono o DNI');
      } else if (errorCode === 'PARSE_ERROR') {
        setError(error.message);
      }
    },
  });

  const addNickname = () => {
    useModeloModalData.setState({
      nombresAlternativos: [...nombresAlternativos, ''],
    });
  };

  const removeNickname = (index: number) => {
    useModeloModalData.setState({
      nombresAlternativos: nombresAlternativos.filter((_, i) => i !== index),
    });
  };

  const handleNicknameChange = (index: number, value: string) => {
    const newNombresAlternativos = [...nombresAlternativos];
    newNombresAlternativos[index] = value;
    useModeloModalData.setState({
      nombresAlternativos: newNombresAlternativos,
    });
  };

  async function edit() {
    if (!genero || !fechaNacimiento) {
      setError('Debe ingresar un género y una fecha de nacimiento');
      return;
    }

    try {
      return await editModelo.mutateAsync({
        id: modelo.id,
        genero,
        fechaNacimiento: fechaNacimiento.toString(),
        nombresAlternativos: nombresAlternativos.filter(
          (apodo) => apodo !== ''
        ),
        instagram: instagram ?? null,
        mail: mail ?? null,
        dni: dni ?? null,
        telefono: telefono ?? undefined,
        nombreCompleto: nombreCompleto ?? undefined,
      });
    } catch (error) {}
  }

  async function handleCancel() {
    useModeloModalData.setState({
      genero: modelo.genero ?? 'N/A',
      fechaNacimiento: modelo.fechaNacimiento
        ? new Date(modelo.fechaNacimiento)
        : undefined,
      open: false,
    });
    setOpenSelect(false);
    setError('');
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
              fechaNacimiento: modelo.fechaNacimiento
                ? new Date(modelo.fechaNacimiento)
                : undefined,
              nombresAlternativos: modelo.nombresAlternativos,
              instagram: modelo.instagram ?? undefined,
              mail: modelo.mail ?? undefined,
              dni: modelo.dni ?? undefined,
              telefono: modelo.telefono ?? undefined,
              nombreCompleto: modelo.nombreCompleto ?? undefined,
            });
          }}
        >
          <EditFillIcon />
        </ModalTriggerEdit>
      </DialogTrigger>
      <DialogContent
        onCloseAutoFocus={handleCancel}
        className='flex max-h-[66%] w-full flex-col gap-y-3 overflow-y-auto rounded-md bg-slate-100 px-5 py-3 md:mx-auto md:max-w-2xl'
      >
        <div className='flex flex-col gap-y-0.5'>
          <p className='w-fit py-1.5 text-base font-semibold'>Editar modelo</p>
          <div className='flex gap-x-3'>
            <div>
              <Label htmlFor='genero'>Género</Label>
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
                  <SelectValue placeholder='Género' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Femenino'>Femenino</SelectItem>
                  <SelectItem value='Masculino'>Masculino</SelectItem>
                  <SelectItem value='Otro'>Otro</SelectItem>
                  <SelectItem disabled={!!modelo.genero} value='N/A'>
                    N/A
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='fechaNacimiento'>Fecha de Nacimiento</Label>
              <Input
                className='bg-white text-black'
                type='date'
                autoComplete='off'
                name='edad'
                id='fechaNacimiento'
                value={
                  fechaNacimiento
                    ? fechaNacimiento.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => {
                  useModeloModalData.setState({
                    fechaNacimiento: new Date(e.currentTarget.value),
                  });
                }}
              />
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-y-2'>
          <Label htmlFor='nombresAlternativos'>Nombres Alternativos</Label>
          {nombresAlternativos.map((apodo, index) => (
            <div key={index} className='flex items-center gap-x-2'>
              <Input
                type='text'
                name={`nombresAlternativos-${index}`}
                id={`nombresAlternativos-${index}`}
                value={apodo}
                onChange={(e) =>
                  handleNicknameChange(index, e.currentTarget.value)
                }
              />
              <Button
                variant='secondary'
                className='px-0'
                onClick={() => removeNickname(index)}
              >
                <TrashIcon />
              </Button>
            </div>
          ))}
          <Button
            className='w-fit pl-0'
            variant='secondary'
            onClick={addNickname}
          >
            <CirclePlus className='h-6 w-6' />
          </Button>
        </div>
        <div>
          <Label htmlFor='nombreCompleto'>Nombre Completo</Label>
          <Input
            type='text'
            name='nombreCompleto'
            id='nombreCompleto'
            value={nombreCompleto ?? ''}
            onChange={(e) => {
              useModeloModalData.setState({
                nombreCompleto: e.currentTarget.value || undefined,
              });
            }}
          />
        </div>
        <div>
          <Label htmlFor='instagram'>Instagram</Label>
          <Input
            type='text'
            name='instagram'
            id='instagram'
            value={instagram ?? ''}
            onChange={(e) => {
              useModeloModalData.setState({
                instagram: e.currentTarget.value || undefined,
              });
            }}
          />
        </div>
        <div>
          <Label htmlFor='mail'>Correo Electrónico</Label>
          <Input
            type='text'
            name='mail'
            id='mail'
            value={mail ?? ''}
            onChange={(e) => {
              useModeloModalData.setState({
                mail: e.currentTarget.value || undefined,
              });
            }}
          />
        </div>
        <div>
          <Label htmlFor='dni'>DNI</Label>
          <Input
            type='text'
            name='dni'
            id='dni'
            value={dni ?? ''}
            onChange={(e) => {
              useModeloModalData.setState({
                dni: e.currentTarget.value || undefined,
              });
            }}
          />
        </div>
        <div>
          <Label htmlFor='telefono'>Teléfono</Label>
          <Input
            type='text'
            name='telefono'
            id='telefono'
            value={telefono ?? ''}
            onChange={(e) => {
              useModeloModalData.setState({
                telefono: e.currentTarget.value || undefined,
              });
            }}
          />
        </div>
        {editModelo.isError || error !== '' ? (
          <p className='text-sm font-semibold text-red-500'>
            {error ??
              'Error al editar el modelo, asegúrese de ingresar todos los campos requeridos correctamente'}
          </p>
        ) : null}
        <div className='flex gap-x-4'>
          <Button
            className='w-full max-w-32'
            onClick={edit}
            disabled={editModelo.isLoading}
          >
            {(editModelo.isLoading && <Loader />) || 'Aceptar'}
          </Button>
          <Button variant='destructive' onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModeloEditModal;
