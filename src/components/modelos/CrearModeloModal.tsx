'use client';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useCrearModeloModal } from './CrearModelo';
import { trpc } from '@/lib/trpc';
import Loader from '../ui/loader';
import CirclePlus from '../icons/CirclePlus';
import { useRef, useState } from 'react';

const CrearModeloModal = ({ open }: { open: boolean }) => {
  const modalModelo = useCrearModeloModal();
  const createModelo = trpc.modelo.createManual.useMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  async function handleSave() {
    console.log(modalModelo.modelo);
    if (modalModelo.modelo.nombreCompleto === '') {
      toast.error('El nombre es un campo obligatorio');
      return;
    }
    if (modalModelo.modelo.telefono === '') {
      toast.error('El teléfono es un campo obligatorio');
      return;
    }
    await createModelo.mutateAsync({
      nombreCompleto: modalModelo.modelo.nombreCompleto,
      telefono: modalModelo.modelo.telefono,
      dni: modalModelo.modelo.dni ?? undefined,
      mail: modalModelo.modelo.mail ?? undefined,
      instagram: modalModelo.modelo.instagram,
      etiquetas: modalModelo.modelo.etiquetas,
    });
    useCrearModeloModal.setState({
      open: false,
      modelo: {
        nombreCompleto: '',
        telefono: '',
        fechaNacimiento: undefined,
        genero: 'N/A',
        etiquetas: [],
        apodos: [],
        dni: '',
        mail: '',
        instagram: '',
      },
    });
  }
  async function handleUpload() {
    if (!video) {
      toast.error('No se ha seleccionado una imagen');
      return;
    }
    const form = new FormData();
    form.append('imagen', video);

    toast.loading('Subiendo foto...');

    await fetch('/api/image', {
      method: 'POST',
      body: form,
    })
      .then(() => {
        toast.dismiss();

        if (inputRef.current) {
          inputRef.current!.value = '';
        }
        setVideo(null);
        toast.success('Foto actualizada con éxito');
      })
      .catch((e) => {
        toast.dismiss();
        toast.error('Error al subir la foto');
        setVideo(null);
      });
  }

  async function handleCancel() {
    useCrearModeloModal.setState({
      open: false,
      modelo: {
        nombreCompleto: '',
        telefono: '',
        fechaNacimiento: undefined,
        genero: 'N/A',
        etiquetas: [],
        apodos: [],
        dni: '',
        mail: '',
        instagram: '',
      },
    });
    setVideo(null);
    // inputRef.current!.value = '';
  }
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={() =>
          useCrearModeloModal.setState({ open: !modalModelo.open })
        }
      >
        <DialogTrigger></DialogTrigger>
        <DialogContent
          onCloseAutoFocus={handleCancel}
          className='max-h-[450px] overflow-y-auto'
        >
          <div className='flex flex-col gap-y-0.5'>
            <p className='text-base font-semibold'>
              Crear participante manualmente
            </p>
            <div className='flex flex-col gap-y-1'>
              <p className='text-sm'>Nombre completo:</p>
              <Input
                type='text'
                placeholder='Nombre Completo'
                className=''
                value={modalModelo.modelo.nombreCompleto}
                onChange={(e) =>
                  useCrearModeloModal.setState({
                    modelo: {
                      ...modalModelo.modelo,
                      nombreCompleto: e.target.value,
                    },
                  })
                }
                required
              />
              <p className='pt-2 text-sm'>Teléfono:</p>
              <Input
                type='text'
                placeholder='Teléfono'
                className=''
                value={modalModelo.modelo.telefono}
                onChange={(e) =>
                  useCrearModeloModal.setState({
                    modelo: { ...modalModelo.modelo, telefono: e.target.value },
                  })
                }
                required
              />
              <p className='pt-2 text-sm'>DNI:</p>
              <Input
                type='text'
                placeholder='DNI'
                className=''
                value={modalModelo.modelo.dni}
                onChange={(e) =>
                  useCrearModeloModal.setState({
                    modelo: { ...modalModelo.modelo, dni: e.target.value },
                  })
                }
              />
              <p className='pt-2 text-sm'>Fecha de nacimiento:</p>
              <Input
                type='date'
                placeholder='Fecha de nacimiento'
                className=''
                value={
                  modalModelo.modelo.fechaNacimiento
                    ?.toISOString()
                    .split('T')[0]
                }
                onChange={(e) =>
                  useCrearModeloModal.setState({
                    modelo: {
                      ...modalModelo.modelo,
                      fechaNacimiento: new Date(e.target.value),
                    },
                  })
                }
              />
              <p className='pt-2 text-sm'>Mail:</p>
              <Input
                type='text'
                placeholder='Mail'
                className=''
                value={modalModelo.modelo.mail}
                onChange={(e) =>
                  useCrearModeloModal.setState({
                    modelo: { ...modalModelo.modelo, mail: e.target.value },
                  })
                }
              />
              <p className='pt-2 text-sm'>Instagram:</p>
              <div className='flex items-center justify-center gap-x-2'>
                <p className='text-xs'>instagram.com/</p>
                <Input
                  type='text'
                  placeholder='Instagram'
                  className=''
                  value={modalModelo.modelo.instagram}
                  onChange={(e) =>
                    useCrearModeloModal.setState({
                      modelo: {
                        ...modalModelo.modelo,
                        instagram: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <p className='pt-2 text-sm'>Foto:</p>
              <div className='flex gap-x-2'>
                <label className='flex aspect-square h-8 w-8 items-center justify-center rounded-full border-2 bg-black text-white hover:cursor-pointer'>
                  <CirclePlus className='h-6 w-6 md:h-8 md:w-8' />
                  <input
                    type='file'
                    name='imagen'
                    className='hidden'
                    accept='image/jpeg,image/png,image/webp'
                    ref={inputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setVideo(file ?? null);
                    }}
                  />
                </label>
                {video && (
                  <span className='mt-1 max-w-full truncate text-sm'>
                    {video.name}
                  </span>
                )}
              </div>
              <p className='pt-2 text-sm'>Etiquetas:</p>
              <Input
                type='text'
                placeholder='Etiquetas'
                className=''
                value={modalModelo.modelo.etiquetas.join(',')}
                onChange={(e) =>
                  useCrearModeloModal.setState({
                    modelo: {
                      ...modalModelo.modelo,
                      etiquetas: e.target.value.split(','),
                    },
                  })
                }
              />
            </div>
            <div className='flex justify-end gap-x-2 pt-2'>
              <Button
                onClick={handleSave}
                className='flex justify-center gap-x-2'
              >
                {createModelo.isLoading ?? <Loader className='h-5 w-5' />}
                <p>Guardar</p>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CrearModeloModal;
