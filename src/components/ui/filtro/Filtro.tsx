'use client';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { XIcon } from 'lucide-react';
import {
  type Filtro as FiltroType,
  FuncionFiltrar,
  defaultAdvancedFilter,
} from '@/lib/filter';
import { cn } from '@/lib/utils';
import { create } from 'zustand';
import FiltroBasicoEtiqueta from '@/components/ui/filtro/FiltroBasicoEtiqueta';
import FiltroBasicoInput from '@/components/ui/filtro/FiltroBasicoInput';
import FiltroAvanzado from '@/components/ui/filtro/FiltroAvanzado';

// Crear variable de zustand
export const useFilter = create<FiltroType & { reset: () => void }>((set) => ({
  ...defaultAdvancedFilter,
  reset: () => set(defaultAdvancedFilter),
}));
export const useFiltroAvanzado = create<{
  isOpen: boolean;
  toggle: () => void;
}>((set) => ({
  isOpen: false,
  toggle: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },
}));

type FilterProps = PropsWithChildren<{
  filterFunction: FuncionFiltrar;
  showTag?: boolean;
  showInput?: boolean;
  className?: string;
  defaultFilter?: Partial<FiltroType>;
}>;

const Filter = ({
  filterFunction,
  className,
  defaultFilter = defaultAdvancedFilter,
  showTag = false,
  showInput: mostrarInput = false,
  children,
}: FilterProps) => {
  const filter = useFilter();
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [tagId, setTagId] = useState<string | undefined>(undefined);

  const { data: tagGroupData } = trpc.tagGroup.getAll.useQuery();

  const { data: tagsData } = groupId
    ? trpc.tag.getByGroupId.useQuery(groupId)
    : trpc.tag.getAll.useQuery();

  const { toggleAdvanced, isOpenAdvanced } = useFiltroAvanzado((s) => ({
    isOpenAdvanced: s.isOpen,
    toggleAdvanced: s.toggle,
  }));

  function editTag(id: string) {
    const selectedTag = tagsData?.find((tag) => tag.id === id)!;

    if (tagId === id) {
      useFilter.setState({
        tags: filter.tags.slice(1, filter.tags.length),
      });
      setTagId(undefined);
      return;
    }
    setTagId(id);
    useFilter.setState({
      ...filter,
      tags: [
        {
          tag: {
            id: selectedTag.id,
            name: selectedTag.name,
          },
          include:
            filter.groups.length > 0
              ? filter.groups[0].include
              : filter.tags.length > 0
                ? filter.tags[0].include
                : true,
        },
      ],
    });
    return;
  }

  function editTagGroup(tagGroupId: string) {
    if (groupId === tagGroupId) {
      useFilter.setState({
        tags: filter.tags.slice(1, filter.tags.length),
        groups: filter.groups.slice(1, filter.groups.length),
      });
      setGroupId(undefined);
      return;
    }
    const group = tagGroupData?.find((group) => group.id === tagGroupId);
    if (!group) return;

    useFilter.setState({
      ...filter,
      groups: [
        {
          group: {
            id: group.id,
            name: group.name,
            color: group.color,
          },
          include:
            filter.groups.length > 0
              ? filter.groups[0].include
              : filter.tags.length > 0
                ? filter.tags[0].include
                : true,
        },
      ],
    });
    setGroupId(tagGroupId);
  }

  function editarInput(input: string) {
    useFilter.setState({ input });
  }

  function resetFilters() {
    useFilter.setState(defaultAdvancedFilter);
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

    useFilter.setState({
      tags: [...tagArray, ...filter.tags.slice(1, filter.tags.length)],
      groups: [...groupArray, ...filter.groups.slice(1, filter.groups.length)],
    });
  }

  const basicTag = useMemo(() => {
    if (
      defaultFilter.tags &&
      defaultFilter.tags.length > 0 &&
      filter.tags.length === 0
    ) {
      return defaultFilter.tags[0].tag.id;
    }

    if (!filter.tags || filter.tags.length === 0) return undefined;

    return filter.tags.length > 0 ? filter.tags[0].tag.id : undefined;
  }, [defaultFilter.tags, filter.tags]);

  const primaryGroup = useMemo(() => {
    if (
      defaultFilter.groups &&
      defaultFilter.groups.length > 0 &&
      filter.groups.length === 0
    ) {
      return defaultFilter.groups[0].group.id;
    }

    return filter.groups.length > 0 ? filter.groups[0].group.id : undefined;
  }, [defaultFilter.groups, filter.groups]);

  useEffect(() => {
    const filtrar = () => {
      filterFunction(filter);
    };
    filtrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);
  return (
    <div className='w-full [&>*]:px-3'>
      <span
        onClick={toggleAdvanced}
        className={cn(
          'flex w-full cursor-pointer text-sm text-gray-700 underline',
          !showTag && 'justify-end'
        )}
      >
        {isOpenAdvanced
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
              (filter.tags.length > 0 && filter.tags[0].include) ||
              (filter.groups.length > 0 && filter.groups[0].include)
            }
            setInclude={(value) => switchIncludeBasico(value)}
            switchDisabled={
              filter.tags.length === 0 && filter.groups.length === 0
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
              inputFiltro={filter.input}
            />
          )}
          <XIcon
            className='h-4 w-4 cursor-pointer justify-self-end'
            onClick={resetFilters}
          />
        </div>
      </div>
      {isOpenAdvanced && (
        <FiltroAvanzado mostrarInput={mostrarInput} showTag={showTag} />
      )}
    </div>
  );
};

export default Filter;
