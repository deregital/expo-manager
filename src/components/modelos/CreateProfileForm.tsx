import CirclePlus from '@/components/icons/CirclePlus';
import CircleXIcon from '@/components/icons/CircleX';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import { useCreateProfileModal } from '@/components/modelos/CreateProfile';
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
import { type RouterOutputs } from '@/server';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import CreateComment from '../modelo/CreateComment';
import { notChoosableTagTypes } from '@/lib/constants';

interface CreateProfileFormProps {
  inputRef: React.RefObject<HTMLInputElement>;
  video: File | null;
  setVideo: React.Dispatch<React.SetStateAction<File | null>>;
  setFotoUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

const CreateProfileForm = ({
  inputRef,
  setFotoUrl,
  setVideo,
  video,
}: CreateProfileFormProps) => {
  const createProfileModal = useCreateProfileModal();

  const [openSelect, setOpenSelect] = useState(false);
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [comboBoxGroupOpen, setComboBoxGroupOpen] = useState(false);
  const [comboBoxTagOpen, setComboBoxTagOpen] = useState(false);
  const { data: tagGroups, isLoading: isLoadingTagGroups } =
    trpc.tagGroup.getAll.useQuery();
  const [selectedTagGroup, setSelectedTagGroup] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [countryIsoCode, setCountryIsoCode] = useState<string>('');
  const { data: tagsFromGroup, isLoading: isLoadingTags } =
    selectedTagGroup === ''
      ? trpc.tag.getAll.useQuery()
      : trpc.tag.getByGroupId.useQuery(selectedTagGroup);

  const currentGroup = useMemo(() => {
    return tagGroups?.find((g) => g.id === selectedTagGroup);
  }, [tagGroups, selectedTagGroup]);

  async function handleDeleteTag(
    tag: NonNullable<RouterOutputs['tag']['getById']>
  ) {
    useCreateProfileModal.setState({
      profile: {
        ...createProfileModal.profile,
        tags: createProfileModal.profile.tags.filter((e) => e.id !== tag.id),
      },
    });
  }

  async function handleDeleteNombre(index: number) {
    const newAlternativeNames = createProfileModal.profile.alternativeNames;
    newAlternativeNames.splice(index, 1);
    useCreateProfileModal.setState({
      profile: {
        ...createProfileModal.profile,
        alternativeNames: newAlternativeNames,
      },
    });
  }
  async function handleAddTag(selectedTag: string) {
    setSelectedTag(selectedTag);
    if (selectedTag === '') return;
    const tag = tagsFromGroup?.find((t) => t.id === selectedTag);
    if (
      useCreateProfileModal
        .getState()
        .profile.tags.find((e) => e.id === tag?.id)
    ) {
      toast.error('La etiqueta ya fue agregada');
      return;
    }
    if (!tag) return;

    // Verificar grupo exclusivo o no
    if (
      tag.group.isExclusive &&
      useCreateProfileModal
        .getState()
        .profile.tags.find(
          (e) => e.group.id === tag?.group.id && e.id !== tag?.id
        )
    ) {
      toast.error('No puedes agregar dos etiquetas exclusivas del mismo grupo');
      return;
    }
    useCreateProfileModal.setState({
      profile: {
        ...createProfileModal.profile,
        tags: [...createProfileModal.profile.tags, tag],
      },
    });
    setSelectedTag('');
    setSelectedTagGroup('');
    setComboBoxTagOpen(false);
    setAddTagOpen(false);
  }

  const { data: allCountries } = trpc.location.getCountries.useQuery();

  const { data: statesBySelectedCountry } =
    trpc.location.getStateByCountry.useQuery(countryIsoCode ?? '', {
      enabled: countryIsoCode !== '',
    });

  const { data: argStates } = trpc.location.getArgStates.useQuery();

  const { data: citiesData } = trpc.location.getCitiesByArgState.useQuery(
    createProfileModal.profile.residenceLocation?.state ?? '',
    {
      enabled: !!createProfileModal.profile.residenceLocation?.state,
    }
  );
  const [isSolvable, setIsSolvable] = useState(false);

  const handleAddComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      comment: { value: string };
    };
    const comment = target.comment.value;
    const isSolvableComment = isSolvable;
    if (!comment || comment === '') return;
    e.currentTarget.reset();
    setIsSolvable(false);
    useCreateProfileModal.setState({
      profile: {
        ...createProfileModal.profile,
        comments: [
          ...createProfileModal.profile.comments,
          {
            content: comment,
            isSolvable: isSolvableComment,
          },
        ],
      },
    });
  };

  const handleDeleteComment = (index: number) => {
    const newComments = createProfileModal.profile.comments;
    newComments.splice(index, 1);
    useCreateProfileModal.setState({
      profile: {
        ...createProfileModal.profile,
        comments: newComments,
      },
    });
  };
  return (
    <>
      <Label className='text-sm'>Nombre completo: (obligatorio)</Label>
      <Input
        type='text'
        placeholder='Nombre Completo'
        value={createProfileModal.profile.fullName}
        onChange={(e) =>
          useCreateProfileModal.setState({
            profile: {
              ...createProfileModal.profile,
              fullName: e.target.value,
            },
          })
        }
        required
      />
      <Label className='pt-2 text-sm'>Teléfono: (obligatorio)</Label>
      <Input
        type='text'
        placeholder='Teléfono'
        value={createProfileModal.profile.phoneNumber}
        onChange={(e) =>
          useCreateProfileModal.setState({
            profile: {
              ...createProfileModal.profile,
              phoneNumber: e.target.value.trim(),
            },
          })
        }
        required
      />
      <Label className='pt-2 text-sm'>Teléfono Secundario:</Label>
      <Input
        type='text'
        placeholder='Teléfono Secundario'
        value={createProfileModal.profile.secondaryPhoneNumber ?? ''}
        onChange={(e) =>
          useCreateProfileModal.setState({
            profile: {
              ...createProfileModal.profile,
              secondaryPhoneNumber: e.target.value.trim(),
            },
          })
        }
      />
      <Label className='pt-2 text-sm'>DNI:</Label>
      <Input
        type='text'
        placeholder='DNI'
        value={createProfileModal.profile.dni ?? ''}
        onChange={(e) =>
          useCreateProfileModal.setState({
            profile: {
              ...createProfileModal.profile,
              dni: e.target.value.trim(),
            },
          })
        }
      />
      <Label className='pt-2 text-sm'>Fecha de nacimiento:</Label>
      <Input
        type='date'
        placeholder='Fecha de nacimiento'
        className='py-4'
        value={
          createProfileModal.profile.birthDate
            ? isNaN(createProfileModal.profile.birthDate?.getTime())
              ? ''
              : createProfileModal.profile.birthDate.toISOString().split('T')[0]
            : ''
        }
        onChange={(e) =>
          useCreateProfileModal.setState({
            profile: {
              ...createProfileModal.profile,
              birthDate: new Date(e.currentTarget.value),
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
            useCreateProfileModal.setState({
              profile: {
                ...createProfileModal.profile,
                gender: value,
              },
            });
          }}
          defaultValue={createProfileModal.profile.gender ?? 'N/A'}
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
        value={createProfileModal.profile.mail ?? ''}
        onChange={(e) =>
          useCreateProfileModal.setState({
            profile: {
              ...createProfileModal.profile,
              mail: e.target.value.trim(),
            },
          })
        }
      />
      <Label className='pt-2 text-sm'>Instagram:</Label>
      <div className='flex items-center justify-center gap-x-2'>
        <p className='text-xs'>instagram.com/</p>
        <Input
          type='text'
          placeholder='Instagram'
          value={createProfileModal.profile.instagram ?? ''}
          onChange={(e) =>
            useCreateProfileModal.setState({
              profile: {
                ...createProfileModal.profile,
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
        {createProfileModal.profile.tags?.map((tag) => {
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
            isLoading={isLoadingTagGroups}
            id={'id'}
            data={
              tagGroups?.filter((g) =>
                g.tags.some((tag) => !notChoosableTagTypes.includes(tag.type))
              ) ?? []
            }
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
            isLoading={isLoadingTags}
            data={
              tagsFromGroup?.filter(
                (tag) => !notChoosableTagTypes.includes(tag.type)
              ) ?? []
            }
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
        {createProfileModal.profile.alternativeNames?.map(
          (alternativeName, index) => {
            return (
              <div
                key={index}
                className='flex w-full items-center justify-between gap-x-3'
              >
                <Input
                  type='text'
                  placeholder='Nombre'
                  value={alternativeName}
                  key={index}
                  onChange={(e) => {
                    const newAlternativeNames =
                      createProfileModal.profile.alternativeNames;
                    newAlternativeNames[index] = e.target.value;
                    useCreateProfileModal.setState({
                      profile: {
                        ...createProfileModal.profile,
                        alternativeNames: newAlternativeNames,
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
          }
        )}
        <CirclePlus
          className='h-5 w-5 cursor-pointer'
          onClick={() => {
            useCreateProfileModal.setState({
              profile: {
                ...createProfileModal.profile,
                alternativeNames: [
                  ...createProfileModal.profile.alternativeNames,
                  '',
                ],
              },
            });
          }}
        />
      </div>
      <div className='flex flex-col gap-y-2'>
        <Label className='pt-2 text-sm'>Nacionalidad:</Label>
        <Select
          onValueChange={(name) => {
            const isoCode =
              allCountries?.find((country) => country.name === name)?.isoCode ??
              '';

            setCountryIsoCode(isoCode);

            useCreateProfileModal.setState({
              profile: {
                ...createProfileModal.profile,
                birthLocation: {
                  ...createProfileModal.profile.birthLocation,
                  country: name,
                },
              },
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecciona tu país' />
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
          disabled={
            !createProfileModal.profile.birthLocation.country ||
            createProfileModal.profile.birthLocation.country === ''
          }
          onValueChange={(name) => {
            const state = statesBySelectedCountry?.find(
              (state) => state.name === name
            );
            if (!state) return;
            const numberLat = Number(state.latitude);
            const numberLong = Number(state.longitude);

            useCreateProfileModal.setState({
              profile: {
                ...createProfileModal.profile,
                birthLocation: {
                  ...createProfileModal.profile.birthLocation,
                  latitude: isNaN(numberLat) ? 0 : numberLat,
                  longitude: isNaN(numberLong) ? 0 : numberLong,
                  city: state.name,
                  state: '',
                },
              },
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecciona tu provincia' />
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
      <div className='flex flex-col gap-y-2 pb-2'>
        <Label className='pt-2 text-sm'>Lugar de residencia (Argentina):</Label>
        <Select
          onValueChange={(value) => {
            useCreateProfileModal.setState({
              profile: {
                ...createProfileModal.profile,
                residenceLocation: {
                  ...createProfileModal.profile.residenceLocation,
                  state: value,
                },
              },
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecciona tu provincia' />
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
          disabled={!createProfileModal.profile.residenceLocation?.state}
          onValueChange={(value) => {
            const city = JSON.parse(value) as {
              latitude: number;
              longitude: number;
              name: string;
            };

            useCreateProfileModal.setState({
              profile: {
                ...createProfileModal.profile,
                residenceLocation: {
                  ...createProfileModal.profile.residenceLocation,
                  city: city.name,
                  latitude: city.latitude,
                  longitude: city.longitude,
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
                  latitude: city.centroid.lat,
                  longitude: city.centroid.lon,
                  name: city.name,
                })}
              >
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='flex flex-col gap-y-2'>
        <Label className='pt-2 text-sm'>Comentarios:</Label>
        <CreateComment
          handleAddComment={handleAddComment}
          isSolvable={isSolvable}
          setIsSolvable={setIsSolvable}
          textSubmit='+'
        />
        <Label className='pt-2 text-xs'>Comentarios agregados:</Label>
        <div className='flex flex-col gap-y-2'>
          {createProfileModal.profile.comments?.map((comment, index) => {
            return (
              <div
                key={index}
                className='flex items-center gap-x-4 rounded-lg bg-gray-300 p-2'
              >
                <Input
                  autoComplete='off'
                  name='comment'
                  value={comment.content}
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
                  <Switch checked={comment.isSolvable} disabled />
                </div>
                <Button className='p-2'>
                  <TrashIcon
                    onClick={() => handleDeleteComment(index)}
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

export default CreateProfileForm;
