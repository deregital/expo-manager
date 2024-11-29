'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useModelosTabla } from '@/components/modelos/table/ModelosTable';
import SwitchEventos from '@/components/ui/SwitchEventos';
import { create } from 'zustand';
import Filtro from '@/components/ui/filtro/Filtro';
import { type Filtro as FiltroType, FuncionFiltrar } from '@/lib/filter';
import { useMemo } from 'react';

export const useModelosFiltro = create(() => ({
  showEventos: false,
}));

const FiltroTabla = () => {
  const searchParams = new URLSearchParams(useSearchParams());
  const pathname = usePathname();
  const router = useRouter();
  const { showEventos } = useModelosFiltro();

  const { cantidadDeModelos, isLoadingModelos } = useModelosTabla((s) => ({
    isLoadingModelos: s.isLoading,
    cantidadDeModelos: s.cantidad,
  }));

  function setAndDeleteSearch<T extends keyof FiltroType>(
    queryString: T,
    value: FiltroType[T]
  ) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      searchParams.delete(queryString);
    } else {
      const valueString =
        typeof value === 'string' ? value : JSON.stringify(value);
      searchParams.set(queryString, valueString);
    }
  }

  const defaultEtiquetas = useMemo(
    () =>
      JSON.parse(
        searchParams.get('etiquetas') ?? '[]'
      ) as FiltroType['etiquetas'],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.get('etiquetas')]
  );

  const defaultGrupos = useMemo(
    () =>
      JSON.parse(searchParams.get('grupos') ?? '[]') as FiltroType['grupos'],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.get('grupos')]
  );

  const filtrar: FuncionFiltrar = ({
    etiquetas,
    input,
    grupos,
    condicionalEtiq,
    condicionalGrupo,
    dni,
    genero,
    instagram,
    mail,
    telefono,
  }) => {
    setAndDeleteSearch('grupos', grupos);
    setAndDeleteSearch('condicionalGrupo', condicionalGrupo);
    setAndDeleteSearch('condicionalEtiq', condicionalEtiq);
    setAndDeleteSearch('dni', dni);
    setAndDeleteSearch('genero', genero);
    setAndDeleteSearch('instagram', instagram);
    setAndDeleteSearch('mail', mail);
    setAndDeleteSearch('telefono', telefono);
    setAndDeleteSearch('etiquetas', etiquetas);
    setAndDeleteSearch('input', input);

    router.push(`${pathname}?${searchParams.toString()}`);
  };

  return (
    <div className='flex items-center justify-between gap-x-4'>
      <Filtro
        defaultFiltro={{
          etiquetas: defaultEtiquetas,
          grupos: defaultGrupos,
        }}
        mostrarInput
        mostrarEtiq
        funcionFiltrado={filtrar}
      >
        <div className='flex w-full items-center justify-between gap-x-4'>
          {!isLoadingModelos && (
            <p className='self-start text-nowrap text-sm text-black/80 md:self-end'>
              {cantidadDeModelos === 0
                ? 'No se encontraron participantes'
                : cantidadDeModelos === 1
                  ? '1 participante encontrado'
                  : `${cantidadDeModelos} participantes encontrados`}
            </p>
          )}
          <SwitchEventos
            setShowEventos={(value) => {
              useModelosFiltro.setState({ showEventos: value });
            }}
            showEventos={showEventos}
          />
        </div>
      </Filtro>
    </div>
  );
};

export default FiltroTabla;
