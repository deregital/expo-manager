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
  mostrarEtiq?: boolean;
  mostrarInput?: boolean;
  className?: string;
  defaultFiltro?: Partial<FiltroType>;
}>;

const Filtro = ({
  funcionFiltrado,
  className,
  defaultFiltro = defaultFilter,
  mostrarEtiq = false,
  mostrarInput = false,
  children,
}: FiltroProps) => {
  const filtro = useFiltro();
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [etiquetaId, setEtiquetaId] = useState<string | undefined>(undefined);

  const { data: tagGroupData } = trpc.grupoEtiqueta.getAll.useQuery();

  const { data: dataEtiquetas } = groupId
    ? trpc.etiqueta.getByGrupoEtiqueta.useQuery(groupId)
    : trpc.etiqueta.getAll.useQuery();

  const { toggle: toggleAvanzado, isOpen: isOpenAvanzado } =
    useFiltroAvanzado();

  function editarEtiq(etiqId: string) {
    const etiquetaSeleccionada = dataEtiquetas?.find((et) => et.id === etiqId)!;

    if (etiquetaId === etiqId) {
      useFiltro.setState({
        etiquetas: filtro.etiquetas.slice(1, filtro.etiquetas.length),
      });
      setEtiquetaId(undefined);
      return;
    }
    setEtiquetaId(etiqId);
    useFiltro.setState({
      ...filtro,
      etiquetas: [
        {
          etiqueta: {
            id: etiquetaSeleccionada.id,
            nombre: etiquetaSeleccionada.nombre,
          },
          include:
            filtro.groups.length > 0
              ? filtro.groups[0].include
              : filtro.etiquetas.length > 0
                ? filtro.etiquetas[0].include
                : true,
        },
      ],
    });
    return;
  }

  function editTagGroup(tagGroupId: string) {
    if (groupId === tagGroupId) {
      useFiltro.setState({
        etiquetas: filtro.etiquetas.slice(1, filtro.etiquetas.length),
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
              : filtro.etiquetas.length > 0
                ? filtro.etiquetas[0].include
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
    setEtiquetaId(undefined);
  }

  function switchIncludeBasico(value: boolean) {
    const etiqueta = dataEtiquetas?.find(
      (etiqueta) => etiqueta.id === etiquetaBasico
    );

    const etiquetaArray = etiqueta
      ? [
          {
            etiqueta: {
              id: etiqueta.id,
              nombre: etiqueta.nombre,
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
      etiquetas: [
        ...etiquetaArray,
        ...filtro.etiquetas.slice(1, filtro.etiquetas.length),
      ],
      groups: [...groupArray, ...filtro.groups.slice(1, filtro.groups.length)],
    });
  }

  const etiquetaBasico = useMemo(() => {
    if (
      defaultFiltro.etiquetas &&
      defaultFiltro.etiquetas.length > 0 &&
      filtro.etiquetas.length === 0
    ) {
      return defaultFiltro.etiquetas[0].etiqueta.id;
    }

    if (!filtro.etiquetas || filtro.etiquetas.length === 0) return undefined;

    return filtro.etiquetas.length > 0
      ? filtro.etiquetas[0].etiqueta.id
      : undefined;
  }, [defaultFiltro.etiquetas, filtro.etiquetas]);

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
          !mostrarEtiq && 'justify-end'
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
        {mostrarEtiq && (
          <FiltroBasicoEtiqueta
            include={
              (filtro.etiquetas.length > 0 && filtro.etiquetas[0].include) ||
              (filtro.groups.length > 0 && filtro.groups[0].include)
            }
            setInclude={(value) => switchIncludeBasico(value)}
            switchDisabled={
              filtro.etiquetas.length === 0 && filtro.groups.length === 0
            }
            editarEtiq={editarEtiq}
            editTagGroup={editTagGroup}
            groupId={primaryGroup}
            etiquetaId={etiquetaBasico}
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
        <FiltroAvanzado mostrarInput={mostrarInput} mostrarEtiq={mostrarEtiq} />
      )}
    </div>
  );
};

export default Filtro;
