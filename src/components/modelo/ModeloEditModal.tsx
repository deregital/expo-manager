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
import { Location, Profile } from 'expo-backend-types';
import { TrashIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

interface ModeloEditModalProps {
  modelo: NonNullable<RouterOutputs['modelo']['getById']>;
}

type ModeloModalData = Pick<
  Profile,
  | 'gender'
  | 'birthDate'
  | 'alternativeNames'
  | 'instagram'
  | 'mail'
  | 'dni'
  | 'secondaryPhoneNumber'
> & {
  open: boolean;
  phoneNumber: Profile['phoneNumber'] | undefined;
  fullName: Profile['fullName'] | undefined;
  birth: Pick<
    Location,
    'city' | 'country' | 'latitude' | 'longitude' | 'state'
  >;
  residence: Pick<
    Location,
    'city' | 'country' | 'latitude' | 'longitude' | 'state'
  >;
};

export function edadFromFechaNacimiento(fechaNacimiento: string) {
  return differenceInYears(new Date(), new Date(fechaNacimiento));
}

const useModeloModalData = create<ModeloModalData>(() => ({
  open: false,
  gender: 'N/A',
  birthDate: null,
  alternativeNames: [],
  instagram: null,
  mail: null,
  dni: null,
  phoneNumber: undefined,
  secondaryPhoneNumber: null,
  fullName: undefined,
  birth: {
    country: '',
    city: '',
    state: '',
    latitude: 0,
    longitude: 0,
  },
  residence: {
    latitude: 0,
    country: 'Argentina',
    longitude: 0,
    state: '',
    city: '',
  },
}));

const ModeloEditModal = ({ modelo }: ModeloEditModalProps) => {
  const {
    open,
    gender,
    birthDate,
    alternativeNames,
    instagram,
    mail,
    dni,
    phoneNumber,
    secondaryPhoneNumber,
    fullName,
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
      birthDate: modelo.birthDate ? new Date(modelo.birthDate) : undefined,
      alternativeNames: modelo.alternativeNames,
      instagram: modelo.instagram ?? undefined,
      mail: modelo.mail ?? undefined,
      dni: modelo.dni ?? undefined,
      phoneNumber: modelo.phoneNumber ?? undefined,
      secondaryPhoneNumber: modelo.secondaryPhoneNumber,
      fullName: modelo.fullName ?? undefined,
      birth: modelo.birthLocation ?? undefined,
      residence: modelo.residenceLocation ?? undefined,
    });
  }, [modelo]);

  const editModelo = trpc.modelo.edit.useMutation({
    onSuccess: () => {
      toast.success('Participante editado con éxito');
      useModeloModalData.setState({
        gender: modelo.gender ?? 'N/A',
        birthDate: modelo.birthDate ? new Date(modelo.birthDate) : undefined,
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
      alternativeNames: [...alternativeNames, ''],
    });
  }

  function removeNickname(index: number) {
    useModeloModalData.setState({
      alternativeNames: alternativeNames.filter((_, i) => i !== index),
    });
  }

  function handleNicknameChange(index: number, value: string) {
    const newNombresAlternativos = [...alternativeNames];
    newNombresAlternativos[index] = value;
    useModeloModalData.setState({
      alternativeNames: newNombresAlternativos,
    });
  }

  function intercambiarNumeros() {
    if (!phoneNumber || !secondaryPhoneNumber) return;
    useModeloModalData.setState((state) => {
      if (!state.secondaryPhoneNumber) return {};
      return {
        phoneNumber: state.secondaryPhoneNumber,
        secondaryPhoneNumber: state.phoneNumber,
      };
    });
  }

  async function edit() {
    if (!phoneNumber) {
      setError('El teléfono es requerido');
      return;
    }
    try {
      return await editModelo.mutateAsync({
        id: modelo.id,
        gender: gender ?? undefined,
        birthDate: birthDate ? birthDate.toString() : undefined,
        alternativeNames: alternativeNames.filter((apodo) => apodo !== ''),
        instagram: instagram ?? null,
        mail: mail ?? null,
        dni: dni ?? null,
        phoneNumber: phoneNumber ?? undefined,
        secondaryPhoneNumber: secondaryPhoneNumber,
        fullName: fullName ?? undefined,
        birth: birth,
        residence: residence,
      });
    } catch (error) {}
  }

  async function handleCancel() {
    useModeloModalData.setState({
      gender: modelo.gender ?? 'N/A',
      birthDate: modelo.birthDate ? new Date(modelo.birthDate) : undefined,
      birth: modelo.birthLocation ?? undefined,
      residence: modelo.residenceLocation ?? undefined,
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
    return secondaryPhoneNumber !== null && secondaryPhoneNumber !== undefined;
  }, [secondaryPhoneNumber]);

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
              gender: modelo.gender ?? 'N/A',
              birthDate: modelo.birthDate
                ? new Date(modelo.birthDate)
                : undefined,
              alternativeNames: modelo.alternativeNames,
              instagram: modelo.instagram ?? undefined,
              mail: modelo.mail ?? undefined,
              dni: modelo.dni ?? undefined,
              phoneNumber: modelo.phoneNumber ?? undefined,
              secondaryPhoneNumber: modelo.secondaryPhoneNumber ?? undefined,
              fullName: modelo.fullName ?? undefined,
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
              value={fullName ?? ''}
              onChange={(e) => {
                useModeloModalData.setState({
                  fullName: e.currentTarget.value || undefined,
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
                  gender: value as string,
                });
              }}
              defaultValue={modelo.gender ?? 'N/A'}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Género' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Femenino'>Femenino</SelectItem>
                <SelectItem value='Masculino'>Masculino</SelectItem>
                <SelectItem value='Otro'>Otro</SelectItem>
                <SelectItem disabled={!!modelo.gender} value='N/A'>
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
                birthDate
                  ? isNaN(birthDate?.getTime())
                    ? ''
                    : birthDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => {
                useModeloModalData.setState({
                  birthDate: new Date(e.currentTarget.value),
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
                  value={phoneNumber ?? ''}
                  onChange={(e) => {
                    useModeloModalData.setState({
                      phoneNumber: e.currentTarget.value || undefined,
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
                        secondaryPhoneNumber: '',
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
                      value={secondaryPhoneNumber ?? ''}
                      onChange={(e) => {
                        useModeloModalData.setState({
                          secondaryPhoneNumber: e.currentTarget.value,
                        });
                      }}
                    />
                    <Button
                      onClick={() => {
                        useModeloModalData.setState({
                          secondaryPhoneNumber: null,
                        });
                      }}
                      className='w-8 p-1'
                      variant={'destructive'}
                    >
                      <TrashIcon className='w-full' />
                    </Button>
                  </div>
                  {secondaryPhoneNumber &&
                    secondaryPhoneNumber.length > 0 &&
                    phoneNumber &&
                    phoneNumber.length > 0 && (
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
          {alternativeNames.map((apodo, index) => (
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
              const state = JSON.parse(value) as {
                latitude: number;
                longitude: number;
                name: string;
              };
              useModeloModalData.setState({
                birth: {
                  ...birth,
                  latitude: state.latitude,
                  longitude: state.longitude,
                  state: state.name,
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
                <SelectItem
                  key={state.isoCode}
                  value={JSON.stringify({
                    latitude: state.latitude,
                    longitude: state.longitude,
                    name: state.name,
                  })}
                >
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
                  ...residence,
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
