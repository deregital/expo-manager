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
import { Profile, UpdateProfileDto } from 'expo-backend-types';
import { TrashIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

interface ProfileEditModalProps {
  profile: NonNullable<RouterOutputs['profile']['getById']>;
}

type ProfileModalData = Pick<
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
  birth: NonNullable<UpdateProfileDto['birth']>;
  residence: NonNullable<UpdateProfileDto['residence']>;
};

export function ageFromBirthDate(birthDate: string) {
  return differenceInYears(new Date(), new Date(birthDate));
}

const useProfileModalData = create<ProfileModalData>(() => ({
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

const ProfileEditModal = ({ profile }: ProfileEditModalProps) => {
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
  } = useProfileModalData();
  const [countryIsoCode, setCountryIsoCode] = useState('');
  const [openSelect, setOpenSelect] = useState(false);
  const [error, setError] = useState('');
  const utils = trpc.useUtils();

  const { data: allCountries } = trpc.location.getCountries.useQuery();
  const { data: statesBySelectedCountry } =
    trpc.location.getStateByCountry.useQuery(countryIsoCode, {
      enabled: !!birth.country,
    });

  const { data: argStates } = trpc.location.getArgStates.useQuery();

  const { data: citiesData } = trpc.location.getCitiesByArgState.useQuery(
    residence?.state ?? '',
    {
      enabled: !!residence?.state,
    }
  );

  const [openCountrySelect, setOpenCountrySelect] = useState(false);
  const [openStateSelect, setOpenStateSelect] = useState(false);
  const [openProvinceSelect, setOpenProvinceSelect] = useState(false);
  const [openCitySelect, setOpenCitySelect] = useState(false);

  useEffect(() => {
    useProfileModalData.setState({
      birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined,
      alternativeNames: profile.alternativeNames,
      instagram: profile.instagram ?? undefined,
      mail: profile.mail ?? undefined,
      dni: profile.dni ?? undefined,
      phoneNumber: profile.phoneNumber ?? undefined,
      secondaryPhoneNumber: profile.secondaryPhoneNumber,
      fullName: profile.fullName ?? undefined,
      birth: profile.birthLocation ?? undefined,
      residence: profile.residenceLocation ?? undefined,
    });
    const isoCode = allCountries?.find(
      (country) => country.name === profile.birthLocation?.country
    )?.isoCode;
    setCountryIsoCode(isoCode ?? '');
  }, [allCountries, profile]);

  const editProfile = trpc.profile.edit.useMutation({
    onSuccess: () => {
      toast.success('Participante editado con éxito');
      useProfileModalData.setState({
        gender: profile.gender ?? 'N/A',
        birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined,
        open: false,
      });
      setOpenSelect(false);
      setError('');
      utils.profile.getById.invalidate(profile.id);
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
    useProfileModalData.setState({
      alternativeNames: [...alternativeNames, ''],
    });
  }

  function removeNickname(index: number) {
    useProfileModalData.setState({
      alternativeNames: alternativeNames.filter((_, i) => i !== index),
    });
  }

  function handleNicknameChange(index: number, value: string) {
    const newNombresAlternativos = [...alternativeNames];
    newNombresAlternativos[index] = value;
    useProfileModalData.setState({
      alternativeNames: newNombresAlternativos,
    });
  }

  function intercambiarNumeros() {
    if (!phoneNumber || !secondaryPhoneNumber) return;
    useProfileModalData.setState((state) => {
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
      return await editProfile.mutateAsync({
        id: profile.id,
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
    useProfileModalData.setState({
      gender: profile.gender ?? 'N/A',
      birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined,
      birth: profile.birthLocation ?? undefined,
      residence: profile.residenceLocation ?? undefined,
      open: false,
    });
    setOpenSelect(false);
    setError('');
  }

  const telefonoSecundarioExists = useMemo(() => {
    return secondaryPhoneNumber !== null && secondaryPhoneNumber !== undefined;
  }, [secondaryPhoneNumber]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        useProfileModalData.setState({
          open: value,
        });
      }}
    >
      <DialogTrigger>
        <ModalTriggerEdit
          onClick={(e) => {
            e.preventDefault();
            useProfileModalData.setState({
              open: true,
              gender: profile.gender ?? 'N/A',
              birthDate: profile.birthDate
                ? new Date(profile.birthDate)
                : undefined,
              alternativeNames: profile.alternativeNames,
              instagram: profile.instagram ?? undefined,
              mail: profile.mail ?? undefined,
              dni: profile.dni ?? undefined,
              phoneNumber: profile.phoneNumber ?? undefined,
              secondaryPhoneNumber: profile.secondaryPhoneNumber ?? undefined,
              fullName: profile.fullName ?? undefined,
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
                useProfileModalData.setState({
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
                useProfileModalData.setState({
                  gender: value as string,
                });
              }}
              defaultValue={profile.gender ?? 'N/A'}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Género' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Femenino'>Femenino</SelectItem>
                <SelectItem value='Masculino'>Masculino</SelectItem>
                <SelectItem value='Otro'>Otro</SelectItem>
                <SelectItem disabled={!!profile.gender} value='N/A'>
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
                useProfileModalData.setState({
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
                useProfileModalData.setState({
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
                useProfileModalData.setState({
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
                useProfileModalData.setState({
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
                    useProfileModalData.setState({
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
                      useProfileModalData.setState({
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
                        useProfileModalData.setState({
                          secondaryPhoneNumber: e.currentTarget.value,
                        });
                      }}
                    />
                    <Button
                      onClick={() => {
                        useProfileModalData.setState({
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
            onValueChange={(name) => {
              const isoCode =
                allCountries?.find((country) => country.name === name)
                  ?.isoCode ?? '';

              setCountryIsoCode(isoCode);

              useProfileModalData.setState({
                birth: {
                  ...birth,
                  country: name,
                },
              });
            }}
            defaultValue={birth.country === '' ? undefined : birth.country}
          >
            <SelectTrigger>
              <SelectValue placeholder='País' />
            </SelectTrigger>
            <SelectContent>
              {allCountries?.map((country) => (
                <SelectItem key={country.isoCode} value={country.name}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            open={openStateSelect}
            onOpenChange={setOpenStateSelect}
            onValueChange={(name) => {
              const state = statesBySelectedCountry?.find(
                (state) => state.name === name
              );

              if (!state) return;

              const numberLat = Number(state.latitude);
              const numberLong = Number(state.longitude);

              useProfileModalData.setState({
                birth: {
                  ...birth,
                  latitude: isNaN(numberLat) ? 0 : numberLat,
                  longitude: isNaN(numberLong) ? 0 : numberLong,
                  city: state.name,
                  state: '',
                },
              });
            }}
            disabled={!birth.country || birth.country === ''}
            defaultValue={birth.city}
          >
            <SelectTrigger>
              <SelectValue placeholder='Provincia' />
            </SelectTrigger>
            <SelectContent>
              {statesBySelectedCountry?.map((state) => (
                <SelectItem key={state.isoCode} value={state.name}>
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
              useProfileModalData.setState({
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
              const city = citiesData?.find((city) => city.name === value);

              if (!city) return;

              useProfileModalData.setState({
                residence: {
                  ...residence,
                  city: city.name,
                  state: residence?.state,
                  latitude: city.centroid.lat,
                  longitude: city.centroid.lon,
                },
              });
            }}
            defaultValue={residence?.city}
            disabled={!residence?.state}
          >
            <SelectTrigger>
              <SelectValue placeholder='Localidad' />
            </SelectTrigger>
            <SelectContent>
              {citiesData?.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {editProfile.isError || error !== '' ? (
          <p className='text-sm font-semibold text-red-500'>
            {error ??
              'Error al editar el participante, asegúrese de ingresar todos los campos requeridos correctamente'}
          </p>
        ) : null}
        <div className='flex gap-x-4'>
          <Button
            className='w-full max-w-32'
            onClick={edit}
            disabled={editProfile.isLoading}
          >
            {(editProfile.isLoading && <Loader />) || 'Aceptar'}
          </Button>
          <Button variant='destructive' onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
