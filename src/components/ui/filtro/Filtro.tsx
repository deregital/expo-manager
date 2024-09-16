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
}>;

const Filtro = ({
  funcionFiltrado,
  className,
  mostrarEtiq = false,
  mostrarInput = false,
  children,
}: FiltroProps) => {
  const filtro = useFiltro();
  const [grupoId, setGrupoId] = useState<string | undefined>(undefined);
  const [etiquetaId, setEtiquetaId] = useState<string | undefined>(undefined);

  const { data: dataGrupoEtiquetas } = trpc.grupoEtiqueta.getAll.useQuery();

  const { data: dataEtiquetas } = grupoId
    ? trpc.etiqueta.getByGrupoEtiqueta.useQuery(grupoId)
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
          include: true,
        },
      ],
    });
    return;
  }

  function editarGrupoEtiq(grupoEtiq: string) {
    if (grupoId === grupoEtiq) {
      useFiltro.setState({
        grupos: filtro.grupos.slice(1, filtro.grupos.length),
      });
      setGrupoId(undefined);
      return;
    }
    const grupo = dataGrupoEtiquetas?.find((grupo) => grupo.id === grupoEtiq);
    if (!grupo) return;

    useFiltro.setState({
      ...filtro,
      grupos: [
        {
          grupo: {
            id: grupo.id,
            nombre: grupo.nombre,
            color: grupo.color,
          },
          include: true,
        },
      ],
    });
    setGrupoId(grupoEtiq);
  }

  function editarInput(input: string) {
    useFiltro.setState({ input });
  }

  function resetFilters() {
    useFiltro.setState(defaultFilter);
    setGrupoId(undefined);
    setEtiquetaId(undefined);
  }

  const etiquetaBasico = useMemo(() => {
    return filtro.etiquetas.length > 0
      ? filtro.etiquetas[0].etiqueta.id
      : undefined;
  }, [filtro.etiquetas]);

  const grupoBasico = useMemo(() => {
    return filtro.grupos.length > 0 ? filtro.grupos[0].grupo.id : undefined;
  }, [filtro.grupos]);

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
            editarEtiq={editarEtiq}
            editarGrupoEtiq={editarGrupoEtiq}
            grupoId={grupoBasico}
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
