import CirclePlus from '@/components/icons/CirclePlus';
import CircleXIcon from '@/components/icons/CircleX';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import { useCrearModeloModal } from '@/components/modelos/CrearModelo';
import ComboBox from '@/components/ui/ComboBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTextColorByBg } from '@/lib/utils';
import { TrashIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { RouterOutputs } from '@/server';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Country, State } from 'country-state-city';

interface FormCrearModeloProps {
  inputRef: React.RefObject<HTMLInputElement>;
  video: File | null;
  setVideo: React.Dispatch<React.SetStateAction<File | null>>;
  setFotoUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

const FormCrearModelo = ({
  inputRef,
  setFotoUrl,
  setVideo,
  video,
}: FormCrearModeloProps) => {
  const modalModelo = useCrearModeloModal();

  const [openSelect, setOpenSelect] = useState(false);
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

  async function handleDeleteNombre(index: number) {
    const newApodos = modalModelo.modelo.apodos;
    newApodos.splice(index, 1);
    useCrearModeloModal.setState({
      modelo: {
        ...modalModelo.modelo,
        apodos: newApodos,
      },
    });
  }
  async function handleAddEtiqueta(etiquetaSelected: string) {
    setEtiquetaSelected(etiquetaSelected);
    if (etiquetaSelected === '') return;
    const etiqueta = etiquetasGrupo?.find((e) => e.id === etiquetaSelected);
    if (
      useCrearModeloModal
        .getState()
        .modelo.etiquetas.find((e) => e.id === etiqueta?.id)
    ) {
      toast.error('La etiqueta ya fue agregada');
      return;
    }
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
    setComboBoxEtiquetaOpen(false);
    setAddEtiquetaOpen(false);
  }

  const allCountries = useMemo(
    () =>
      Country.getAllCountries().filter(
        (country) => country.name !== 'Palestinian Territory Occupied'
      ),
    []
  );
  const statesBySelectedCountry = useMemo(() => {
    if (!modalModelo.modelo.paisNacimiento) return [];

    const countryCode = allCountries.find(
      (country) => country.name === modalModelo.modelo.paisNacimiento
    )?.isoCode;

    return State.getStatesOfCountry(countryCode);
  }, [allCountries, modalModelo.modelo.paisNacimiento]);

  const provinces = useMemo(() => {
    return State.getStatesOfCountry('AR');
  }, []);

  const { data: citiesData } = trpc.mapa.getLocalidadesByProvincia.useQuery(
    modalModelo.modelo.residencia?.provincia ?? '',
    {
      enabled: !!modalModelo.modelo.residencia?.provincia,
    }
  );

  return (
    <>
      <Label className='text-sm'>Nombre completo: (obligatorio)</Label>
      <Input
        type='text'
        placeholder='Nombre Completo'
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
        value={modalModelo.modelo.telefono}
        onChange={(e) =>
          useCrearModeloModal.setState({
            modelo: {
              ...modalModelo.modelo,
              telefono: e.target.value.trim(),
            },
          })
        }
        required
      />
      <Label className='pt-2 text-sm'>DNI:</Label>
      <Input
        type='text'
        placeholder='DNI'
        value={modalModelo.modelo.dni}
        onChange={(e) =>
          useCrearModeloModal.setState({
            modelo: { ...modalModelo.modelo, dni: e.target.value.trim() },
          })
        }
      />
      <Label className='pt-2 text-sm'>Fecha de nacimiento:</Label>
      <Input
        type='date'
        placeholder='Fecha de nacimiento'
        className='py-4'
        value={
          modalModelo.modelo.fechaNacimiento
            ? isNaN(modalModelo.modelo.fechaNacimiento?.getTime())
              ? ''
              : modalModelo.modelo.fechaNacimiento.toISOString().split('T')[0]
            : ''
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
          <SelectTrigger>
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
        value={modalModelo.modelo.mail}
        onChange={(e) =>
          useCrearModeloModal.setState({
            modelo: { ...modalModelo.modelo, mail: e.target.value.trim() },
          })
        }
      />
      <Label className='pt-2 text-sm'>Instagram:</Label>
      <div className='flex items-center justify-center gap-x-2'>
        <p className='text-xs'>instagram.com/</p>
        <Input
          type='text'
          placeholder='Instagram'
          value={modalModelo.modelo.instagram}
          onChange={(e) =>
            useCrearModeloModal.setState({
              modelo: {
                ...modalModelo.modelo,
                instagram: e.target.value.trim(),
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
          <span className='mt-1 max-w-full truncate text-sm'>{video.name}</span>
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
            selectedIf={grupoEtiquetaSelected ? grupoEtiquetaSelected : ''}
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
              handleAddEtiqueta(selectedItem);
            }}
            selectedIf={etiquetaSelected}
            triggerChildren={
              <>
                <span className='truncate'>
                  {etiquetaSelected !== ''
                    ? (etiquetasGrupo?.find(
                        (etiqueta) => etiqueta.id === etiquetaSelected
                      )?.nombre ?? 'Buscar etiqueta...')
                    : 'Buscar etiqueta...'}
                </span>
                <EtiquetasFillIcon className='h-5 w-5' />
              </>
            }
          />
        </div>
      )}
      <Label className='pt-2 text-sm'>Nombres alternativos:</Label>
      <div className='flex w-full flex-col items-start gap-y-1'>
        {modalModelo.modelo.apodos?.map((apodo, index) => {
          return (
            <div
              key={index}
              className='flex w-full items-center justify-between gap-x-3'
            >
              <Input
                type='text'
                placeholder='Nombre'
                value={apodo}
                key={index}
                onChange={(e) => {
                  const newApodos = modalModelo.modelo.apodos;
                  newApodos[index] = e.target.value;
                  useCrearModeloModal.setState({
                    modelo: {
                      ...modalModelo.modelo,
                      apodos: newApodos,
                    },
                  });
                }}
              />
              <TrashIcon
                onClick={() => handleDeleteNombre(index)}
                className='h-6 w-6 cursor-pointer'
                width={16}
                height={16}
              />
            </div>
          );
        })}
        <CirclePlus
          className='h-5 w-5 cursor-pointer'
          onClick={() => {
            useCrearModeloModal.setState({
              modelo: {
                ...modalModelo.modelo,
                apodos: [...modalModelo.modelo.apodos, ''],
              },
            });
          }}
        />
      </div>
      <div className='flex flex-col gap-y-2'>
        <Label className='pt-2 text-sm'>Nacionalidad:</Label>
        <Select
          onValueChange={(value) => {
            useCrearModeloModal.setState({
              modelo: {
                ...modalModelo.modelo,
                paisNacimiento: value as string,
              },
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecciona tu país' />
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
          disabled={!modalModelo.modelo.paisNacimiento}
          onValueChange={(value) => {
            useCrearModeloModal.setState({
              modelo: {
                ...modalModelo.modelo,
                provinciaNacimiento: value,
              },
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecciona tu provincia' />
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
      <div className='flex flex-col gap-y-2 pb-2'>
        <Label className='pt-2 text-sm'>Lugar de residencia (Argentina):</Label>
        <Select
          onValueChange={(value) => {
            useCrearModeloModal.setState({
              modelo: {
                ...modalModelo.modelo,
                residencia: {
                  localidad: modalModelo.modelo.residencia?.localidad,
                  latitud: modalModelo.modelo.residencia?.latitud,
                  longitud: modalModelo.modelo.residencia?.longitud,
                  provincia: value,
                },
              },
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecciona tu provincia' />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.isoCode} value={province.name}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          disabled={!modalModelo.modelo.residencia?.provincia}
          onValueChange={(value) => {
            const city = JSON.parse(value as string) as {
              latitud: number;
              longitud: number;
              nombre: string;
            };
            useCrearModeloModal.setState({
              modelo: {
                ...modalModelo.modelo,
                residencia: {
                  localidad: city.nombre,
                  latitud: city.latitud,
                  longitud: city.longitud,
                  provincia: modalModelo.modelo.residencia?.provincia,
                },
              },
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecciona tu localidad' />
          </SelectTrigger>
          <SelectContent>
            {citiesData?.map((city) => (
              <SelectItem
                key={city.id}
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
    </>
  );
};

export default FormCrearModelo;
