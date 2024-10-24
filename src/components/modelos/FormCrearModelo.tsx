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
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import CrearComentario from '../modelo/CrearComentario';

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
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [comboBoxGroupOpen, setComboBoxGroupOpen] = useState(false);
  const [comboBoxTagOpen, setComboBoxTagOpen] = useState(false);
  const { data: tagGroups } = trpc.tagGroup.getAll.useQuery();
  const [selectedTagGroup, setSelectedTagGroup] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const { data: tagsFromGroup } =
    selectedTagGroup === ''
      ? trpc.tag.getAll.useQuery()
      : trpc.tag.getByGroupId.useQuery(selectedTagGroup);

  const currentGroup = useMemo(() => {
    return tagGroups?.find((g) => g.id === selectedTagGroup);
  }, [tagGroups, selectedTagGroup]);

  async function handleDeleteTag(
    tag: NonNullable<RouterOutputs['tag']['getById']>
  ) {
    useCrearModeloModal.setState({
      modelo: {
        ...modalModelo.modelo,
        etiquetas: modalModelo.modelo.etiquetas.filter((e) => e.id !== tag.id),
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
  async function handleAddTag(selectedTag: string) {
    setSelectedTag(selectedTag);
    if (selectedTag === '') return;
    const tag = tagsFromGroup?.find((t) => t.id === selectedTag);
    if (
      useCrearModeloModal
        .getState()
        .modelo.etiquetas.find((e) => e.id === tag?.id)
    ) {
      toast.error('La etiqueta ya fue agregada');
      return;
    }
    if (!tag) return;

    // Verificar grupo exclusivo o no
    if (
      tag.group.isExclusive &&
      useCrearModeloModal
        .getState()
        .modelo.etiquetas.find(
          (e) => e.group.id === tag?.group.id && e.id !== tag?.id
        )
    ) {
      toast.error('No puedes agregar dos etiquetas exclusivas del mismo grupo');
      return;
    }
    useCrearModeloModal.setState({
      modelo: {
        ...modalModelo.modelo,
        etiquetas: [
          // TODO: Fix this type casting
          ...(modalModelo.modelo.etiquetas as any),
          tag,
        ],
      },
    });
    setSelectedTag('');
    setSelectedTagGroup('');
    setComboBoxTagOpen(false);
    setAddTagOpen(false);
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
      (country) => country.isoCode === modalModelo.modelo.paisNacimiento
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
  const [esResoluble, setEsResoluble] = useState(false);

  const handleAddComentario = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      comentario: { value: string };
    };
    const comentario = target.comentario.value;
    const isSolvable = esResoluble;
    if (!comentario || comentario === '') return;
    e.currentTarget.reset();
    setEsResoluble(false);
    useCrearModeloModal.setState({
      modelo: {
        ...modalModelo.modelo,
        comentarios: [
          ...modalModelo.modelo.comentarios,
          {
            contenido: comentario,
            isSolvable: isSolvable,
          },
        ],
      },
    });
  };

  const handleDeleteComentario = (index: number) => {
    const newComentarios = modalModelo.modelo.comentarios;
    newComentarios.splice(index, 1);
    useCrearModeloModal.setState({
      modelo: {
        ...modalModelo.modelo,
        comentarios: newComentarios,
      },
    });
  };
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
      <Label className='pt-2 text-sm'>Teléfono Secundario:</Label>
      <Input
        type='text'
        placeholder='Teléfono Secundario'
        value={modalModelo.modelo.telefonoSecundario}
        onChange={(e) =>
          useCrearModeloModal.setState({
            modelo: {
              ...modalModelo.modelo,
              telefonoSecundario: e.target.value.trim(),
            },
          })
        }
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
        {modalModelo.modelo.etiquetas?.map((tag) => {
          if (!tag) return;
          return (
            <Badge
              className='group whitespace-nowrap transition-transform duration-200 ease-in-out hover:shadow-md'
              style={{
                backgroundColor: tag?.group.color,
                color: getTextColorByBg(tag.group.color ?? ''),
              }}
              key={tag.id}
            >
              {tag.name}

              <CircleXIcon
                onClick={() => handleDeleteTag(tag)}
                className='invisible w-0 cursor-pointer group-hover:visible group-hover:ml-1 group-hover:w-4'
                width={16}
                height={16}
              />
            </Badge>
          );
        })}
        {addTagOpen ? (
          <CircleXIcon
            onClick={() => setAddTagOpen(false)}
            className='h-5 w-5 cursor-pointer'
          />
        ) : (
          <CirclePlus
            className='h-5 w-5 cursor-pointer'
            onClick={() => setAddTagOpen(true)}
          />
        )}
      </div>
      {addTagOpen && (
        <div className='flex flex-wrap gap-x-2 gap-y-1'>
          <ComboBox
            open={comboBoxGroupOpen}
            setOpen={setComboBoxGroupOpen}
            value='name'
            id={'id'}
            data={tagGroups ?? []}
            onSelect={(selectedItem) => {
              if (selectedItem === selectedTagGroup) {
                setSelectedTagGroup('');
                setComboBoxGroupOpen(false);
              } else {
                setSelectedTagGroup(selectedItem);
                setComboBoxGroupOpen(false);
              }
            }}
            wFullMobile
            selectedIf={selectedTagGroup ? selectedTagGroup : ''}
            triggerChildren={
              <>
                <span className='max-w-[calc(100%-30px)] truncate'>
                  {selectedTagGroup ? currentGroup?.name : 'Buscar grupo...'}
                </span>
                <EtiquetasFillIcon className='h-5 w-5' />
              </>
            }
          />
          <ComboBox
            data={tagsFromGroup ?? []}
            id={'id'}
            value='name'
            wFullMobile
            open={comboBoxTagOpen}
            setOpen={setComboBoxTagOpen}
            onSelect={(selectedItem) => {
              handleAddTag(selectedItem);
            }}
            selectedIf={selectedTag}
            triggerChildren={
              <>
                <span className='truncate'>
                  {selectedTag !== ''
                    ? (tagsFromGroup?.find((tag) => tag.id === selectedTag)
                        ?.name ?? 'Buscar etiqueta...')
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
              <SelectItem key={country.isoCode} value={country.isoCode}>
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
              <SelectItem key={state.isoCode} value={state.isoCode}>
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
      <div className='flex flex-col gap-y-2'>
        <Label className='pt-2 text-sm'>Comentarios:</Label>
        <CrearComentario
          handleAddComentario={handleAddComentario}
          esResoluble={esResoluble}
          setEsResoluble={setEsResoluble}
          textSubmit='+'
        />
        <Label className='pt-2 text-xs'>Comentarios agregados:</Label>
        <div className='flex flex-col gap-y-2'>
          {modalModelo.modelo.comentarios?.map((comentario, index) => {
            return (
              <div
                key={index}
                className='flex items-center gap-x-4 rounded-lg bg-gray-300 p-2'
              >
                <Input
                  autoComplete='off'
                  name='comentario'
                  value={comentario.contenido}
                  disabled
                  className='flex-grow'
                />
                <div className='flex flex-col items-center'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className='mb-1 whitespace-nowrap text-sm'>
                          S/R
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Simple / Resoluble</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Switch checked={comentario.isSolvable} disabled />
                </div>
                <Button className='p-2'>
                  <TrashIcon
                    onClick={() => handleDeleteComentario(index)}
                    className='h-4 w-4 cursor-pointer'
                  />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FormCrearModelo;
