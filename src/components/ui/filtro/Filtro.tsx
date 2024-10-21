'use client';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { XIcon } from 'lucide-react';
import {
  type Filtro as FiltroType,
  FuncionFiltrar,
  defaultFilter,
} from '@/lib/filter';
import { cn } from '@/lib/utils';
import { create } from 'zustand';
import FiltroBasicoEtiqueta from '@/components/ui/filtro/FiltroBasicoEtiqueta';
import FiltroBasicoInput from '@/components/ui/filtro/FiltroBasicoInput';
import FiltroAvanzado from '@/components/ui/filtro/FiltroAvanzado';

// Crear variable de zustand
export const useFiltro = create<FiltroType>(() => defaultFilter);
export const useFiltroAvanzado = create<{
  isOpen: boolean;
  toggle: () => void;
}>((set) => ({
  isOpen: false,
  toggle: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },
}));

type FiltroProps = PropsWithChildren<{
  funcionFiltrado: FuncionFiltrar;
  showTag?: boolean;
  mostrarInput?: boolean;
  className?: string;
  defaultFiltro?: Partial<FiltroType>;
}>;

const Filtro = ({
  funcionFiltrado,
  className,
  defaultFiltro = defaultFilter,
  showTag = false,
  mostrarInput = false,
  children,
}: FiltroProps) => {
  const filtro = useFiltro();
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [tagId, setTagId] = useState<string | undefined>(undefined);

  const { data: tagGroupData } = trpc.tagGroup.getAll.useQuery();

  const { data: tagsData } = groupId
    ? trpc.tag.getByGroupId.useQuery(groupId)
    : trpc.tag.getAll.useQuery();

  const { toggle: toggleAvanzado, isOpen: isOpenAvanzado } =
    useFiltroAvanzado();

  function editTag(id: string) {
    const selectedTag = tagsData?.find((tag) => tag.id === id)!;

    if (tagId === id) {
      useFiltro.setState({
        tags: filtro.tags.slice(1, filtro.tags.length),
      });
      setTagId(undefined);
      return;
    }
    setTagId(id);
    useFiltro.setState({
      ...filtro,
      tags: [
        {
          tag: {
            id: selectedTag.id,
            name: selectedTag.name,
          },
          include:
            filtro.groups.length > 0
              ? filtro.groups[0].include
              : filtro.tags.length > 0
                ? filtro.tags[0].include
                : true,
        },
      ],
    });
    return;
  }

  function editTagGroup(tagGroupId: string) {
    if (groupId === tagGroupId) {
      useFiltro.setState({
        tags: filtro.tags.slice(1, filtro.tags.length),
        groups: filtro.groups.slice(1, filtro.groups.length),
      });
      setGroupId(undefined);
      return;
    }
    const group = tagGroupData?.find((group) => group.id === tagGroupId);
    if (!group) return;

    useFiltro.setState({
      ...filtro,
      groups: [
        {
          group: {
            id: group.id,
            name: group.name,
            color: group.color,
          },
          include:
            filtro.groups.length > 0
              ? filtro.groups[0].include
              : filtro.tags.length > 0
                ? filtro.tags[0].include
                : true,
        },
      ],
    });
    setGroupId(tagGroupId);
  }

  function editarInput(input: string) {
    useFiltro.setState({ input });
  }

  function resetFilters() {
    useFiltro.setState(defaultFilter);
    setGroupId(undefined);
    setTagId(undefined);
  }

  function switchIncludeBasico(value: boolean) {
    const tag = tagsData?.find((t) => t.id === basicTag);

    const tagArray: FiltroType['tags'] = tag
      ? [
          {
            tag: {
              id: tag.id,
              name: tag.name,
            },
            include: value,
          },
        ]
      : [];

    const group = tagGroupData?.find(
      (tagGroup) => tagGroup.id === primaryGroup
    );

    const groupArray: FiltroType['groups'] = group
      ? [
          {
            group: {
              id: group.id,
              name: group?.name,
              color: group?.color,
            },
            include: value,
          },
        ]
      : [];

    useFiltro.setState({
      tags: [...tagArray, ...filtro.tags.slice(1, filtro.tags.length)],
      groups: [...groupArray, ...filtro.groups.slice(1, filtro.groups.length)],
    });
  }

  const basicTag = useMemo(() => {
    if (
      defaultFiltro.tags &&
      defaultFiltro.tags.length > 0 &&
      filtro.tags.length === 0
    ) {
      return defaultFiltro.tags[0].tag.id;
    }

    if (!filtro.tags || filtro.tags.length === 0) return undefined;

    return filtro.tags.length > 0 ? filtro.tags[0].tag.id : undefined;
  }, [defaultFiltro.tags, filtro.tags]);

  const primaryGroup = useMemo(() => {
    if (
      defaultFiltro.groups &&
      defaultFiltro.groups.length > 0 &&
      filtro.groups.length === 0
    ) {
      return defaultFiltro.groups[0].group.id;
    }

    return filtro.groups.length > 0 ? filtro.groups[0].group.id : undefined;
  }, [defaultFiltro.groups, filtro.groups]);

  useEffect(() => {
    const filtrar = () => {
      funcionFiltrado(filtro);
    };
    filtrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);
  return (
    <div className='w-full [&>*]:px-3'>
      <span
        onClick={toggleAvanzado}
        className={cn(
          'flex w-full cursor-pointer text-sm text-gray-700 underline',
          !showTag && 'justify-end'
        )}
      >
        {isOpenAvanzado
          ? 'Ocultar buscador avanzado'
          : 'Mostrar buscador avanzado'}
      </span>
      <div
        className={cn(
          'flex w-full flex-col items-center justify-between gap-4 py-1 md:flex-row',
          className
        )}
      >
        {showTag && (
          <FiltroBasicoEtiqueta
            include={
              (filtro.tags.length > 0 && filtro.tags[0].include) ||
              (filtro.groups.length > 0 && filtro.groups[0].include)
            }
            setInclude={(value) => switchIncludeBasico(value)}
            switchDisabled={
              filtro.tags.length === 0 && filtro.groups.length === 0
            }
            editTag={editTag}
            editTagGroup={editTagGroup}
            groupId={primaryGroup}
            tagId={basicTag}
          />
        )}
        <div className='order-10 flex w-full flex-1 md:order-2'>{children}</div>
        <div className='order-3 flex w-full items-center justify-end gap-x-2 md:w-fit'>
          {mostrarInput && (
            <FiltroBasicoInput
              editarInput={editarInput}
              inputFiltro={filtro.input}
            />
          )}
          <XIcon
            className='h-4 w-4 cursor-pointer justify-self-end'
            onClick={resetFilters}
          />
        </div>
      </div>
      {isOpenAvanzado && (
        <FiltroAvanzado mostrarInput={mostrarInput} showTag={showTag} />
      )}
    </div>
  );
};

export default Filtro;
