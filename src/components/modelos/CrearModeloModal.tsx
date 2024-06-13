'use client';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useCrearModeloModal } from './CrearModelo';
import { trpc } from '@/lib/trpc';
import Loader from '../ui/loader';
import CirclePlus from '../icons/CirclePlus';
import { useMemo, useRef, useState } from 'react';
import { RouterOutputs } from '@/server';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { getTextColorByBg } from '@/lib/utils';
import CircleXIcon from '../icons/CircleX';
import ComboBox from '../ui/ComboBox';
import EtiquetasFillIcon from '../icons/EtiquetasFillIcon';

const CrearModeloModal = ({ open }: { open: boolean }) => {
  const modalModelo = useCrearModeloModal();
  const utils = trpc.useUtils();
  const createModelo = trpc.modelo.createManual.useMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [openSelect, setOpenSelect] = useState(false);
  const [addNombreOpen, setAddNombreOpen] = useState(false);
  const [nombreAlternativo, setNombreAlternativo] = useState<string>('');
  const [addEtiquetaOpen, setAddEtiquetaOpen] = useState(false);
  const [comboBoxGrupoOpen, setComboBoxGrupoOpen] = useState(false);
  const [comboBoxEtiquetaOpen, setComboBoxEtiquetaOpen] = useState(false);
  const { data: grupoEtiquetas } = trpc.grupoEtiqueta.getAll.useQuery();
  const [grupoEtiquetaSelected, setGrupoEtiquetaSelected] =
    useState<string>('');
  const [etiquetaSelected, setEtiquetaSelected] = useState<string>('');
  const { data: etiquetasGrupo } =
    grupoEtiquetaSelected === ''
      ? trpc.etiqueta.getAll.useQuery()
      : trpc.etiqueta.getByGrupoEtiqueta.useQuery(grupoEtiquetaSelected);
  const currentGrupo = useMemo(() => {
    return grupoEtiquetas?.find((g) => g.id === grupoEtiquetaSelected);
  }, [grupoEtiquetas, grupoEtiquetaSelected]);

  async function handleSave() {
    if (modalModelo.modelo.nombreCompleto === '') {
      toast.error('El nombre es un campo obligatorio');
      return;
    }
    if (modalModelo.modelo.telefono === '') {
      toast.error('El teléfono es un campo obligatorio');
      return;
    }
    await createModelo
      .mutateAsync({
        nombreCompleto: modalModelo.modelo.nombreCompleto,
        telefono: modalModelo.modelo.telefono,
        dni: modalModelo.modelo.dni ?? undefined,
        mail: modalModelo.modelo.mail ?? undefined,
        fechaNacimiento: modalModelo.modelo.fechaNacimiento
          ? modalModelo.modelo.fechaNacimiento.toISOString()
          : undefined,
        instagram: modalModelo.modelo.instagram,
        etiquetas: modalModelo.modelo.etiquetas.map((e) => e.id),
        apodos: modalModelo.modelo.apodos,
      })
      .then(async (res: RouterOutputs['modelo']['createManual']) => {
        await handleUpload(res.id);
        toast.success('Participante creado correctamente');
        utils.modelo.getAll.invalidate();
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

  async function handleUpload(id: string) {
    if (!video) return;
    const form = new FormData();
    form.append('imagen', video);
    form.append('id', id);
    form.append('url', fotoUrl ?? '');

    await fetch('/api/image', {
      method: 'POST',
      body: form,
    })
      .then(() => {
        if (inputRef.current) {
          inputRef.current!.value = '';
        }
        setVideo(null);
        setFotoUrl(null);
      })
      .catch((e) => {
        setVideo(null);
        setFotoUrl(null);
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
    setFotoUrl(null);
    setGrupoEtiquetaSelected('');
    setEtiquetaSelected('');
    setAddEtiquetaOpen(false);
    setAddNombreOpen(false);
    setNombreAlternativo('');
    // inputRef.current!.value = '';
  }
  async function handleDeleteEtiqueta(
    etiqueta: NonNullable<RouterOutputs['etiqueta']['getById']>
  ) {
    useCrearModeloModal.setState({
      modelo: {
        ...modalModelo.modelo,
        etiquetas: modalModelo.modelo.etiquetas.filter(
          (e) => e.id !== etiqueta.id
        ),
      },
    });
  }
  async function handleDeleteNombre(apodo: string) {
    useCrearModeloModal.setState({
      modelo: {
        ...modalModelo.modelo,
        apodos: modalModelo.modelo.apodos.filter((e) => e !== apodo),
      },
    });
  }
  async function handleAddEtiqueta() {
    if (etiquetaSelected === '') return;
    const etiqueta = etiquetasGrupo?.find((e) => e.id === etiquetaSelected);
    if (!etiqueta) return;

    // Verificar grupo exclusivo o no
    if (
      etiqueta.grupo.esExclusivo &&
      useCrearModeloModal
        .getState()
        .modelo.etiquetas.find(
          (e) => e.grupo.id === etiqueta?.grupo.id && e.id !== etiqueta?.id
        )
    ) {
      toast.error('No puedes agregar dos etiquetas exclusivas del mismo grupo');
      return;
    }
    useCrearModeloModal.setState({
      modelo: {
        ...modalModelo.modelo,
        etiquetas: [...modalModelo.modelo.etiquetas, etiqueta],
      },
    });
    setEtiquetaSelected('');
    setGrupoEtiquetaSelected('');
    setAddEtiquetaOpen(false);
  }
  async function handleAddNombre() {
    if (nombreAlternativo === '') return;
    useCrearModeloModal.setState({
      modelo: {
        ...modalModelo.modelo,
        apodos: [...modalModelo.modelo.apodos, nombreAlternativo],
      },
    });
    setNombreAlternativo('');
    setAddNombreOpen(false);
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
        <DialogContent onCloseAutoFocus={handleCancel} className=''>
          <div className='flex flex-col gap-y-0.5'>
            <p className='text-base font-semibold'>
              Crear participante manualmente
            </p>
            <div className='mt-1 flex max-h-[400px] flex-col gap-y-1 overflow-y-auto px-2'>
              <Label className='text-sm'>Nombre completo: (obligatorio)</Label>
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
              <Label className='pt-2 text-sm'>Teléfono: (obligatorio)</Label>
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
              <Label className='pt-2 text-sm'>DNI:</Label>
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
              <Label className='pt-2 text-sm'>Fecha de nacimiento:</Label>
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
                      fechaNacimiento: new Date(e.currentTarget.value),
                    },
                  })
                }
              />
              <div>
                <Label htmlFor='genero'>Genero</Label>
                <Select
                  open={openSelect}
                  onOpenChange={setOpenSelect}
                  onValueChange={(value) => {
                    useCrearModeloModal.setState({
                      modelo: {
                        ...modalModelo.modelo,
                        genero: value as string,
                      },
                    });
                  }}
                  defaultValue={modalModelo.modelo.genero ?? 'N/A'}
                >
                  <SelectTrigger className=''>
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
              <Label className='pt-2 text-sm'>Mail:</Label>
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
              <Label className='pt-2 text-sm'>Instagram:</Label>
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
              <Label className='pt-2 text-sm'>Foto:</Label>
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
                      setFotoUrl(!file ? null : URL.createObjectURL(file));
                    }}
                  />
                </label>
                {video && (
                  <span className='mt-1 max-w-full truncate text-sm'>
                    {video.name}
                  </span>
                )}
              </div>
              <Label className='pt-2 text-sm'>Etiquetas:</Label>
              <div className='flex flex-wrap items-center gap-2'>
                {modalModelo.modelo.etiquetas?.map((etiqueta) => {
                  if (!etiqueta) return;
                  return (
                    <Badge
                      className='group whitespace-nowrap transition-transform duration-200 ease-in-out hover:shadow-md'
                      style={{
                        backgroundColor: etiqueta?.grupo.color,
                        color: getTextColorByBg(etiqueta.grupo.color),
                      }}
                      key={etiqueta.id}
                    >
                      {etiqueta.nombre}

                      <CircleXIcon
                        onClick={() => handleDeleteEtiqueta(etiqueta)}
                        className='invisible w-0 cursor-pointer group-hover:visible group-hover:ml-1 group-hover:w-4'
                        width={16}
                        height={16}
                      />
                    </Badge>
                  );
                })}
                {addEtiquetaOpen ? (
                  <CircleXIcon
                    onClick={() => setAddEtiquetaOpen(false)}
                    className='h-5 w-5 cursor-pointer'
                  />
                ) : (
                  <CirclePlus
                    className='h-5 w-5 cursor-pointer'
                    onClick={() => setAddEtiquetaOpen(true)}
                  />
                )}
              </div>
              {addEtiquetaOpen && (
                <div className='flex flex-wrap gap-x-2 gap-y-1'>
                  <ComboBox
                    open={comboBoxGrupoOpen}
                    setOpen={setComboBoxGrupoOpen}
                    value='nombre'
                    id={'id'}
                    data={grupoEtiquetas ?? []}
                    onSelect={(selectedItem) => {
                      if (selectedItem === grupoEtiquetaSelected) {
                        setGrupoEtiquetaSelected('');
                        setComboBoxGrupoOpen(false);
                      } else {
                        setGrupoEtiquetaSelected(selectedItem);
                        setComboBoxGrupoOpen(false);
                      }
                    }}
                    wFullMobile
                    selectedIf={
                      grupoEtiquetaSelected ? grupoEtiquetaSelected : ''
                    }
                    triggerChildren={
                      <>
                        <span className='max-w-[calc(100%-30px)] truncate'>
                          {grupoEtiquetaSelected
                            ? currentGrupo?.nombre
                            : 'Buscar grupo...'}
                        </span>
                        <EtiquetasFillIcon className='h-5 w-5' />
                      </>
                    }
                  />
                  <ComboBox
                    data={etiquetasGrupo ?? []}
                    id={'id'}
                    value='nombre'
                    wFullMobile
                    open={comboBoxEtiquetaOpen}
                    setOpen={setComboBoxEtiquetaOpen}
                    onSelect={(selectedItem) => {
                      if (selectedItem === etiquetaSelected) {
                        setEtiquetaSelected('');
                        setComboBoxEtiquetaOpen(false);
                      } else {
                        setEtiquetaSelected(selectedItem);
                        setComboBoxEtiquetaOpen(false);
                      }
                    }}
                    selectedIf={etiquetaSelected}
                    triggerChildren={
                      <>
                        <span className='truncate'>
                          {etiquetaSelected !== ''
                            ? etiquetasGrupo?.find(
                                (etiqueta) => etiqueta.id === etiquetaSelected
                              )?.nombre ?? 'Buscar etiqueta...'
                            : 'Buscar etiqueta...'}
                        </span>
                        <EtiquetasFillIcon className='h-5 w-5' />
                      </>
                    }
                  />
                  <Button onClick={handleAddEtiqueta}>Agregar</Button>
                </div>
              )}
              <Label className='pt-2 text-sm'>Nombres alternativos:</Label>
              <div className='flex flex-wrap items-center gap-2'>
                {modalModelo.modelo.apodos?.map((apodo, index) => {
                  if (!apodo) return;
                  return (
                    <Badge
                      className='group whitespace-nowrap transition-transform duration-200 ease-in-out hover:shadow-md'
                      style={{
                        backgroundColor: '#000000',
                        color: getTextColorByBg('#000000'),
                      }}
                      key={index}
                    >
                      {apodo}

                      <CircleXIcon
                        onClick={() => handleDeleteNombre(apodo)}
                        className='invisible w-0 cursor-pointer group-hover:visible group-hover:ml-1 group-hover:w-4'
                        width={16}
                        height={16}
                      />
                    </Badge>
                  );
                })}
                {addNombreOpen ? (
                  <CircleXIcon
                    onClick={() => setAddNombreOpen(false)}
                    className='h-5 w-5 cursor-pointer'
                  />
                ) : (
                  <CirclePlus
                    className='h-5 w-5 cursor-pointer'
                    onClick={() => setAddNombreOpen(true)}
                  />
                )}
              </div>
              <div>
                {addNombreOpen && (
                  <div className='flex gap-x-2'>
                    <Input
                      type='text'
                      placeholder='Nombre'
                      className=''
                      value={nombreAlternativo}
                      onChange={(e) => setNombreAlternativo(e.target.value)}
                    />
                    <Button onClick={handleAddNombre}>Agregar</Button>
                  </div>
                )}
              </div>
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
