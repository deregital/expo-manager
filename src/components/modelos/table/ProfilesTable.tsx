import { useProfilesFilter } from '@/components/modelos/TableFilter';
import { DataTable } from '@/components/modelos/table/dataTable';
import { trpc } from '@/lib/trpc';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { generateColumns } from '@/components/modelos/table/columns';
import { Filtro, filterProfiles } from '@/lib/filter';
import { useSearchQuery } from '@/lib/useSearchQuery';
import { notChoosableTagTypes } from '@/lib/constants';

export const useProfilesTable = create<{
  count: number;
  isLoading: boolean;
}>(() => ({
  count: 0,
  isLoading: true,
}));

const ProfilesTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showEvents } = useProfilesFilter((s) => ({
    showEvents: s.showEvents,
  }));

  const inputQuery = useSearchQuery(searchParams, 'input');
  const tagQuery = useSearchQuery(searchParams, 'etiquetas');
  const tagGroupQuery = useSearchQuery(searchParams, 'grupos');
  const instagramQuery = useSearchQuery(searchParams, 'instagram');
  const mailQuery = useSearchQuery(searchParams, 'mail');
  const dniQuery = useSearchQuery(searchParams, 'dni');
  const genderQuery = useSearchQuery(searchParams, 'genero');
  const phoneNumberQuery = useSearchQuery(searchParams, 'telefono');

  const [search, setSearch] = useState<Filtro>({
    input: inputQuery ?? '',
    tags: tagQuery ?? [],
    groups: tagGroupQuery ?? [],
    condicionalTag: 'AND',
    condicionalGroup: 'AND',
    instagram: instagramQuery,
    mail: mailQuery,
    dni: dniQuery,
    gender: genderQuery,
    phoneNumber: phoneNumberQuery ?? '',
  });

  function goToModel(id: string) {
    router.push(`/modelo/${id}`);
  }

  const {
    data: profiles,
    isLoading,
    isRefetching,
  } = trpc.profile.getAll.useQuery();

  useEffect(() => {
    setSearch({
      input: inputQuery ?? '',
      tags: tagQuery ?? [],
      groups: tagGroupQuery ?? [],
      condicionalTag: 'AND',
      condicionalGroup: 'AND',
      instagram: instagramQuery,
      mail: mailQuery,
      dni: dniQuery,
      gender: genderQuery,
      phoneNumber: phoneNumberQuery ?? '',
    });
  }, [
    dniQuery,
    tagQuery,
    genderQuery,
    tagGroupQuery,
    inputQuery,
    instagramQuery,
    mailQuery,
    searchParams,
    phoneNumberQuery,
  ]);

  const data = useMemo(() => {
    return filterProfiles(profiles ?? [], search);
  }, [search, profiles]);

  useEffect(() => {
    useProfilesTable.setState({
      isLoading,
      count: data.length,
    });
  }, [isLoading, data]);

  return (
    <DataTable
      isLoading={isLoading && !isRefetching}
      columns={generateColumns(showEvents)}
      data={data.map((profile) => ({
        ...profile,
        tags: profile.tags.filter(
          (tag) => !notChoosableTagTypes.includes(tag.type)
        ),
      }))}
      initialSortingColumn={{ id: 'shortId', desc: true }}
      onClickRow={goToModel}
    />
  );
};

export default ProfilesTable;
