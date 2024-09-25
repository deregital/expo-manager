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
import { Country, State } from 'country-state-city';
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
  nombreCompleto: string | undefined;
  paisNacimiento: string | undefined;
  provinciaNacimiento: string | undefined;
  residencia:
    | {
        latitud?: number | undefined;
        longitud?: number | undefined;
        provincia: string | undefined;
        localidad: string | undefined;
      }
    | undefined;
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
  paisNacimiento: undefined,
  provinciaNacimiento: undefined,
  residencia: {
    latitud: undefined,
    longitud: undefined,
    provincia: undefined,
    localidad: undefined,
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
    nombreCompleto,
    paisNacimiento,
    provinciaNacimiento,
    residencia,
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
      nombreCompleto: modelo.nombreCompleto ?? undefined,
      paisNacimiento: modelo.paisNacimiento ?? '',
      provinciaNacimiento: modelo.provinciaNacimiento ?? '',
      residencia: {
        latitud: modelo.residencia?.latitud,
        longitud: modelo.residencia?.longitud,
        provincia: modelo.residencia?.provincia ?? '',
        localidad: modelo.residencia?.localidad ?? '',
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
        nombreCompleto: nombreCompleto ?? undefined,
        paisNacimiento: paisNacimiento ?? '',
        provinciaNacimiento: provinciaNacimiento ?? '',
        residenciaLatitud: residencia?.latitud,
        residenciaLongitud: residencia?.longitud,
        provinciaResidencia: residencia?.provincia,
        localidadResidencia: residencia?.localidad,
      });
    } catch (error) {}
  }

  async function handleCancel() {
    useModeloModalData.setState({
      genero: modelo.genero ?? 'N/A',
      fechaNacimiento: modelo.fechaNacimiento
        ? new Date(modelo.fechaNacimiento)
        : undefined,
      paisNacimiento: modelo.paisNacimiento ?? '',
      provinciaNacimiento: modelo.provinciaNacimiento ?? '',
      residencia: {
        latitud: modelo.residencia?.latitud,
        longitud: modelo.residencia?.longitud,
        provincia: modelo.residencia?.provincia ?? '',
        localidad: modelo.residencia?.localidad ?? '',
      },
      open: false,
    });
    setOpenSelect(false);
    setError('');
  }

  const allCountries = useMemo(
    () =>
      Country.getAllCountries().filter(
        (country) => country.name !== 'Palestinian Territory Occupied'
      ),
    []
  );
  const statesBySelectedCountry = useMemo(() => {
    if (!paisNacimiento) return [];
    const countryCode = allCountries.find(
      (country) => country.name === paisNacimiento
    )?.isoCode;

    return State.getStatesOfCountry(countryCode);
  }, [allCountries, paisNacimiento]);

  const provinces = useMemo(() => {
    return State.getStatesOfCountry('AR');
  }, []);

  const { data: citiesData } = trpc.mapa.getLocalidadesByProvincia.useQuery(
    residencia?.provincia ?? '',
    {
      enabled: !!residencia?.provincia,
    }
  );

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
                paisNacimiento: value as string,
              });
            }}
            defaultValue={paisNacimiento}
          >
            <SelectTrigger>
              <SelectValue placeholder='País' />
            </SelectTrigger>
            <SelectContent>
              {allCountries.map((country) => (
                <SelectItem key={country.isoCode} value={country.name}>
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
                provinciaNacimiento: value as string,
              });
            }}
            disabled={!paisNacimiento}
            defaultValue={provinciaNacimiento}
          >
            <SelectTrigger>
              <SelectValue placeholder='Provincia' />
            </SelectTrigger>
            <SelectContent>
              {statesBySelectedCountry.map((state) => (
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
              useModeloModalData.setState({
                residencia: {
                  ...residencia,
                  localidad: residencia?.localidad,
                  provincia: value as string,
                },
              });
            }}
            defaultValue={residencia?.provincia}
          >
            <SelectTrigger>
              <SelectValue placeholder='Provincia' />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.name} value={province.name}>
                  {province.name}
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
                residencia: {
                  localidad: city.nombre as string,
                  provincia: residencia?.provincia,
                  latitud: city.latitud,
                  longitud: city.longitud,
                },
              });
            }}
            defaultValue={JSON.stringify({
              latitud: residencia?.latitud,
              longitud: residencia?.longitud,
              nombre: residencia?.localidad,
            })}
            disabled={!residencia?.provincia}
          >
            <SelectTrigger>
              <SelectValue placeholder='Localidad' />
            </SelectTrigger>
            <SelectContent>
              {citiesData?.map((city) => (
                <SelectItem
                  key={city.nombre}
                  value={JSON.stringify({
                    latitud: city.centroide.lat,
                    longitud: city.centroide.lon,
                    nombre: city.nombre,
                  })}
                >
                  {city.nombre}
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
