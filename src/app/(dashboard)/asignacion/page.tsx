'use client';

import TagsComboAndList from '@/components/etiquetas/allocation/TagsComboAndList';
import ProfilesComboAndList, {
  allocationSelectedData,
} from '@/components/etiquetas/allocation/ProfilesComboAndList';
import Filter from '@/components/ui/filtro/Filtro';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { type FuncionFiltrar, filterProfiles } from '@/lib/filter';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface AsignacionPageProps {}

const AsignacionPage = ({}: AsignacionPageProps) => {
  const utils = trpc.useUtils();
  const allocate = trpc.tag.massiveAllocation.useMutation();
  const deallocate = trpc.tag.masiveDeallocation.useMutation();
  const router = useRouter();

  const { data: profiles, isLoading: isLoadingProfiles } =
    trpc.profile.getAll.useQuery();

  const [filteredProfiles, setFilteredProfiles] = useState<
    RouterOutputs['profile']['getAll']
  >(profiles ?? []);

  const {
    tagsList,
    profiles: profileList,
    clearTags,
    clearProfiles,
    clearGroup,
  } = allocationSelectedData();

  const filter: FuncionFiltrar = (filter) => {
    if (!profiles) return;
    setFilteredProfiles(filterProfiles(profiles, filter));
  };

  async function allocateTags() {
    const tagIds = tagsList.map((t) => t.id);
    const profileIds = profileList.map((m) => m.id);

    // chequeo para no agregar etiquetas bloqueantes a modelos que ya tengan etiquetas bloqueantes
    for (const profile of profileList) {
      const newTags = tagsList.filter(
        (t) => !profile.tags.find((et) => et.id === t.id)
      );

      if (newTags.length === 0) continue;

      const tagsSameGroup = newTags.filter((t) =>
        profile.tags.map((tag) => tag.groupId).includes(t.groupId)
      );

      const sameTags = [
        ...tagsSameGroup.filter((e) => e.group.isExclusive),
        ...profile.tags.filter(
          (tag) =>
            tagsSameGroup.map((t) => t.groupId).includes(tag.groupId) &&
            tag.group.isExclusive
        ),
      ];

      if (sameTags.filter((t) => t.group.isExclusive).length > 0) {
        toast.error(
          `El participante ${profile.fullName} ya tiene asignadas etiquetas exclusivas del mismo grupo: ` +
            sameTags
              .filter((e) => e.group.isExclusive)
              .map((e) => e.name)
              .join(', ')
        );
        return;
      }
    }

    await allocate
      .mutateAsync({
        tagIds,
        profileIds: profileIds,
      })
      .then(() => {
        toast.success('Etiquetas asignadas correctamente');
        clearProfiles();
        clearTags();
        clearGroup();
        utils.profile.getAll.invalidate();
      });
  }

  async function desasignarEtiquetas() {
    const tagIds = tagsList.map((e) => e.id);
    const profileIds = profileList.map((m) => m.id);

    await deallocate
      .mutateAsync({
        tagIds,
        profileIds: profileIds,
      })
      .then(() => {
        toast.success('Etiquetas desasignadas correctamente');
        clearProfiles();
        clearTags();
        clearGroup();
        utils.profile.getAll.invalidate();
      });
  }

  return (
    <div className='flex flex-col gap-y-3'>
      <div className='flex items-center gap-x-4 pb-3'>
        <ArrowLeft
          className='cursor-pointer md:h-8 md:w-8'
          onClick={() => router.back()}
        />
        <h1 className='text-xl font-bold md:text-3xl'>
          Asignación masiva de etiquetas
        </h1>
      </div>
      <Filter className='py-1' filterFunction={filter} showTag showInput />
      <div className='flex h-auto gap-x-2 border-t-[1px] border-t-black/20 p-3 md:p-5 '>
        <div className='flex-1'>
          <ProfilesComboAndList
            profiles={filteredProfiles}
            profilesLoading={isLoadingProfiles}
          />
          {profileList.length === 0 && (
            <p className='mt-2'>
              Seleccione los participantes a los que quiere asignarle o
              desasignarle etiquetas
            </p>
          )}
        </div>
        <div className='flex-1'>
          <TagsComboAndList />
          {tagsList.length === 0 && (
            <p className='mt-2'>
              Seleccione las etiquetas que quiere asignar o desasignar de los
              participantes
            </p>
          )}
        </div>
      </div>
      <div className='ml-4 flex gap-x-4'>
        <Button
          className='mt-4'
          onClick={() => allocateTags()}
          disabled={
            tagsList.length === 0 ||
            profileList.length === 0 ||
            deallocate.isLoading ||
            allocate.isLoading
          }
        >
          {allocate.isLoading ? <Loader /> : 'Asignar'}
        </Button>
        <Button
          className='mt-4'
          onClick={() => desasignarEtiquetas()}
          disabled={
            tagsList.length === 0 ||
            profileList.length === 0 ||
            deallocate.isLoading ||
            allocate.isLoading
          }
        >
          {deallocate.isLoading || allocate.isLoading ? (
            <Loader />
          ) : (
            'Desasignar'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AsignacionPage;
