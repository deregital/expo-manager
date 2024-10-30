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
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { differenceInYears } from 'date-fns';
import { TrashIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  telefonoSecundario: string | null | undefined;
  nombreCompleto: string | undefined;
  birth: {
    country: string | undefined;
    state: string | undefined;
    latitude: number | undefined;
    longitude: number | undefined;
  };
  residence: {
    latitude: number | undefined;
    longitude: number | undefined;
    state: string | undefined;
    city: string | undefined;
  };
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
  telefonoSecundario: undefined,
  nombreCompleto: undefined,
  birth: {
    country: undefined,
    state: undefined,
    latitude: undefined,
    longitude: undefined,
  },
  residence: {
    latitude: undefined,
    longitude: undefined,
    state: undefined,
    city: undefined,
  },
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
    telefonoSecundario,
    nombreCompleto,
    birth,
    residence,
  } = useModeloModalData();
  const [openSelect, setOpenSelect] = useState(false);
  const [error, setError] = useState('');
  const utils = trpc.useUtils();

  const [openCountrySelect, setOpenCountrySelect] = useState(false);
  const [openStateSelect, setOpenStateSelect] = useState(false);
  const [openProvinceSelect, setOpenProvinceSelect] = useState(false);
  const [openCitySelect, setOpenCitySelect] = useState(false);

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
      telefonoSecundario: modelo.telefonoSecundario,
      nombreCompleto: modelo.nombreCompleto ?? undefined,
      birth: {
        country: modelo.paisNacimiento ?? '',
        state: modelo.provinciaNacimiento ?? '',
        // TODO: Add latitud and longitud to the modelo
        latitude: /*modelo.nacimiento?.latitud*/ undefined,
        longitude: /*modelo.nacimiento?.longitud*/ undefined,
      },
      residence: {
        latitude: modelo.residencia?.latitud,
        longitude: modelo.residencia?.longitud,
        state: modelo.residencia?.provincia ?? '',
        city: modelo.residencia?.localidad ?? '',
      },
    });
  }, [modelo]);

  const editModelo = trpc.modelo.edit.useMutation({
    onSuccess: () => {
      toast.success('Participante editado con éxito');
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

      const isZodError = error.data?.zodError !== null;
      if (isZodError) {
        const zodError = error.data?.zodError;
        if (!zodError) return;
        const message = Object.values(zodError.fieldErrors)[0]?.[0];
        setError(message ?? 'Error al editar el participante');
        return;
      }

      if (errorCode === 'CONFLICT') {
        setError(error.message);
      } else if (errorCode === 'PARSE_ERROR') {
        setError(error.message);
      }
    },
  });

  function addNickname() {
    useModeloModalData.setState({
      nombresAlternativos: [...nombresAlternativos, ''],
    });
  }

  function removeNickname(index: number) {
    useModeloModalData.setState({
      nombresAlternativos: nombresAlternativos.filter((_, i) => i !== index),
    });
  }

  function handleNicknameChange(index: number, value: string) {
    const newNombresAlternativos = [...nombresAlternativos];
    newNombresAlternativos[index] = value;
    useModeloModalData.setState({
      nombresAlternativos: newNombresAlternativos,
    });
  }

  function intercambiarNumeros() {
    if (!telefono || !telefonoSecundario) return;
    useModeloModalData.setState((state) => {
      if (!state.telefonoSecundario) return {};
      return {
        telefono: state.telefonoSecundario,
        telefonoSecundario: state.telefono,
      };
    });
  }

  async function edit() {
    if (!telefono) {
      setError('El teléfono es requerido');
      return;
    }
    try {
      return await editModelo.mutateAsync({
        id: modelo.id,
        genero,
        fechaNacimiento: fechaNacimiento
          ? fechaNacimiento.toString()
          : undefined,
        nombresAlternativos: nombresAlternativos.filter(
          (apodo) => apodo !== ''
        ),
        instagram: instagram ?? null,
        mail: mail ?? null,
        dni: dni ?? null,
        telefono: telefono ?? undefined,
        telefonoSecundario: telefonoSecundario,
        nombreCompleto: nombreCompleto ?? undefined,
        paisNacimiento: birth.country ?? '',
        provinciaNacimiento: birth.state ?? '',
        residenciaLatitud: residence?.latitude,
        residenciaLongitud: residence?.longitude,
        provinciaResidencia: residence?.state,
        localidadResidencia: residence?.city,
      });
    } catch (error) {}
  }

  async function handleCancel() {
    useModeloModalData.setState({
      genero: modelo.genero ?? 'N/A',
      fechaNacimiento: modelo.fechaNacimiento
        ? new Date(modelo.fechaNacimiento)
        : undefined,
      birth: {
        country: modelo.paisNacimiento ?? '',
        state: modelo.provinciaNacimiento ?? '',
        // TODO: Add latitud and longitud to the modelo
        latitude: /*modelo.nacimiento?.latitud*/ undefined,
        longitude: /*modelo.nacimiento?.longitud*/ undefined,
      },
      residence: {
        latitude: modelo.residencia?.latitud,
        longitude: modelo.residencia?.longitud,
        state: modelo.residencia?.provincia ?? '',
        city: modelo.residencia?.localidad ?? '',
      },
      open: false,
    });
    setOpenSelect(false);
    setError('');
  }

  const { data: allCountries } = trpc.location.getCountries.useQuery();
  const { data: statesBySelectedCountry } =
    trpc.location.getStateByCountry.useQuery(birth.country ?? '', {
      enabled: !!birth.country,
    });

  const { data: argStates } = trpc.location.getArgStates.useQuery();

  const { data: citiesData } = trpc.location.getCitiesByArgState.useQuery(
    residence?.state ?? '',
    {
      enabled: !!residence?.state,
    }
  );
  const telefonoSecundarioExists = useMemo(() => {
    return telefonoSecundario !== null && telefonoSecundario !== undefined;
  }, [telefonoSecundario]);

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
              telefonoSecundario: modelo.telefonoSecundario ?? undefined,
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
        </div>
        <div className='flex gap-x-3 [&>*]:w-full'>
          <div>
            <Label htmlFor='nombreCompleto'>Nombre Completo</Label>
            <Input
              required
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
            <Label htmlFor='genero'>Género</Label>
            <Select
              required
              open={openSelect}
              onOpenChange={setOpenSelect}
              onValueChange={(value) => {
                useModeloModalData.setState({
                  genero: value as string,
                });
              }}
              defaultValue={modelo.genero ?? 'N/A'}
            >
              <SelectTrigger className='w-full'>
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
              required
              className='w-full bg-background text-black'
              type='date'
              autoComplete='off'
              name='edad'
              id='fechaNacimiento'
              value={
                fechaNacimiento
                  ? isNaN(fechaNacimiento?.getTime())
                    ? ''
                    : fechaNacimiento.toISOString().split('T')[0]
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
        <div className='flex gap-x-3'>
          <div className='w-full'>
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
          <div className='w-full'>
            <Label htmlFor='mail'>Correo Electrónico</Label>
            <Input
              type='email'
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
        </div>
        <div className='flex gap-x-3'>
          <div className='w-full'>
            <Label htmlFor='dni'>DNI</Label>
            <Input
              type='number'
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
          <div className='w-full'>
            <Label htmlFor='telefono'>Teléfono</Label>
            <div
              className={cn(
                'flex items-center',
                telefonoSecundarioExists && 'flex-col'
              )}
            >
              <div className='flex w-full items-center gap-x-2'>
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
                {!telefonoSecundarioExists && (
                  <Button
                    variant='secondary'
                    className='bg-black p-2 text-white hover:bg-gray-700'
                    title='Agregar Teléfono Secundario'
                    onClick={() => {
                      useModeloModalData.setState({
                        telefonoSecundario: '',
                      });
                    }}
                  >
                    +
                  </Button>
                )}
              </div>

              {telefonoSecundarioExists && (
                <div className='mt-2 w-full'>
                  <Label htmlFor='telefonoSecundario'>
                    Teléfono Secundario
                  </Label>
                  <div className='flex items-center gap-x-2'>
                    <Input
                      type='text'
                      name='telefonoSecundario'
                      id='telefonoSecundario'
                      value={telefonoSecundario ?? ''}
                      onChange={(e) => {
                        useModeloModalData.setState({
                          telefonoSecundario: e.currentTarget.value,
                        });
                      }}
                    />
                    <Button
                      onClick={() => {
                        useModeloModalData.setState({
                          telefonoSecundario: null,
                        });
                      }}
                      className='w-8 p-1'
                      variant={'destructive'}
                    >
                      <TrashIcon className='w-full' />
                    </Button>
                  </div>
                  {telefonoSecundario &&
                    telefonoSecundario.length > 0 &&
                    telefono &&
                    telefono.length > 0 && (
                      <Button
                        variant='secondary'
                        className='mt-2 bg-blue-800 p-2 text-white hover:bg-blue-900'
                        onClick={intercambiarNumeros}
                      >
                        Intercambiar Teléfonos
                      </Button>
                    )}
                </div>
              )}
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
        <Label>Lugar de nacimiento:</Label>
        <div className='flex items-center justify-between gap-x-4 pb-3'>
          <Select
            open={openCountrySelect}
            onOpenChange={setOpenCountrySelect}
            onValueChange={(value) => {
              useModeloModalData.setState({
                birth: {
                  ...birth,
                  country: value as string,
                },
              });
            }}
            defaultValue={birth.country}
          >
            <SelectTrigger>
              <SelectValue placeholder='País' />
            </SelectTrigger>
            <SelectContent>
              {allCountries?.map((country) => (
                <SelectItem key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            open={openStateSelect}
            onOpenChange={setOpenStateSelect}
            onValueChange={(value) => {
              useModeloModalData.setState({
                birth: {
                  ...birth,
                  state: value as string,
                },
              });
            }}
            disabled={!birth.country}
            defaultValue={birth.state}
          >
            <SelectTrigger>
              <SelectValue placeholder='Provincia' />
            </SelectTrigger>
            <SelectContent>
              {statesBySelectedCountry?.map((state) => (
                <SelectItem key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Label>Lugar de residencia:</Label>
        <div className='flex items-center justify-between gap-x-4 pb-3'>
          <Select
            open={openProvinceSelect}
            onOpenChange={setOpenProvinceSelect}
            onValueChange={(value) => {
              useModeloModalData.setState({
                residence: {
                  ...residence,
                  state: value as string,
                },
              });
            }}
            defaultValue={residence?.state}
          >
            <SelectTrigger>
              <SelectValue placeholder='Provincia' />
            </SelectTrigger>
            <SelectContent>
              {argStates?.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            open={openCitySelect}
            onOpenChange={setOpenCitySelect}
            onValueChange={(value) => {
              const city = JSON.parse(value as string) as {
                latitud: number;
                longitud: number;
                nombre: string;
              };

              useModeloModalData.setState({
                residence: {
                  city: city.nombre as string,
                  state: residence?.state,
                  latitude: city.latitud,
                  longitude: city.longitud,
                },
              });
            }}
            defaultValue={JSON.stringify({
              latitud: residence?.latitude,
              longitud: residence?.longitude,
              nombre: residence?.city,
            })}
            disabled={!residence?.state}
          >
            <SelectTrigger>
              <SelectValue placeholder='Localidad' />
            </SelectTrigger>
            <SelectContent>
              {citiesData?.map((city) => (
                <SelectItem
                  key={city.name}
                  value={JSON.stringify({
                    latitud: city.centroid.lat,
                    longitud: city.centroid.lon,
                    nombre: city.name,
                  })}
                >
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {editModelo.isError || error !== '' ? (
          <p className='text-sm font-semibold text-red-500'>
            {error ??
              'Error al editar el participante, asegúrese de ingresar todos los campos requeridos correctamente'}
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
