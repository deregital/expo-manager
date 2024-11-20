'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useProfilesTable } from '@/components/modelos/table/ProfilesTable';
import SwitchEventos from '@/components/ui/SwitchEventos';
import { create } from 'zustand';
import Filter from '@/components/ui/filtro/Filtro';
import {
  type Filtro as FiltroType,
  type FuncionFiltrar,
  type FiltroTraducido,
} from '@/lib/filter';
import { useMemo } from 'react';

export const useProfilesFilter = create(() => ({
  showEvents: false,
}));

const TableFilter = () => {
  const searchParams = new URLSearchParams(useSearchParams());
  const pathname = usePathname();
  const router = useRouter();
  const { showEvents } = useProfilesFilter();

  const { profileCount, isLoadingProfiles } = useProfilesTable((s) => ({
    isLoadingProfiles: s.isLoading,
    profileCount: s.count,
  }));

  function setAndDeleteSearch<T extends keyof FiltroTraducido>(
    queryString: T,
    value: FiltroTraducido[T]
  ) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      searchParams.delete(queryString);
    } else {
      const valueString =
        typeof value === 'string' ? value : JSON.stringify(value);
      searchParams.set(queryString, valueString);
    }
  }

  const defaultTags = useMemo(
    () =>
      JSON.parse(searchParams.get('etiquetas') ?? '[]') as FiltroType['tags'],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.get('etiquetas')]
  );

  const defaultGroups = useMemo(
    () =>
      JSON.parse(searchParams.get('grupos') ?? '[]') as FiltroType['groups'],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.get('grupos')]
  );

  const filter: FuncionFiltrar = ({
    tags,
    input,
    groups,
    condicionalTag,
    condicionalGroup,
    dni,
    gender,
    instagram,
    mail,
    phoneNumber,
  }) => {
    setAndDeleteSearch('grupos', groups);
    setAndDeleteSearch('condicionalGrupo', condicionalGroup);
    setAndDeleteSearch('condicionalEtiq', condicionalTag);
    setAndDeleteSearch('dni', dni);
    setAndDeleteSearch('genero', gender);
    setAndDeleteSearch('instagram', instagram);
    setAndDeleteSearch('mail', mail);
    setAndDeleteSearch('telefono', phoneNumber);
    setAndDeleteSearch('etiquetas', tags);
    setAndDeleteSearch('input', input);

    router.push(`${pathname}?${searchParams.toString()}`);
  };

  return (
    <div className='flex items-center justify-between gap-x-4'>
      <Filter
        defaultFilter={{
          tags: defaultTags,
          groups: defaultGroups,
        }}
        showInput
        showTag
        filterFunction={filter}
      >
        <div className='flex w-full items-center justify-between gap-x-4'>
          {!isLoadingProfiles && (
            <p className='self-start text-nowrap text-sm text-black/80 md:self-end'>
              {profileCount === 0
                ? 'No se encontraron participantes'
                : profileCount === 1
                  ? '1 participante encontrado'
                  : `${profileCount} participantes encontrados`}
            </p>
          )}
          <SwitchEventos
            setShowEventos={(value) => {
              useProfilesFilter.setState({ showEvents: value });
            }}
            showEventos={showEvents}
          />
        </div>
      </Filter>
    </div>
  );
};

export default TableFilter;
