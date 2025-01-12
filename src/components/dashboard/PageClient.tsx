'use client';
import ProfilesChartCard from '@/components/dashboard/ProfilesChartCard';
import MensajesCard from '@/components/dashboard/MensajesCard';
import ProfilesList from '@/components/dashboard/ProfilesList';
import SharedCard from '@/components/dashboard/SharedCard';
import ComboBox from '@/components/ui/ComboBox';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import {
  addDays,
  eachDayOfInterval,
  format,
  formatDate,
  startOfMonth,
} from 'date-fns';
import { XIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { create } from 'zustand';

interface PageClientProps {}

export const useDashboardData = create<{
  from: Date;
  to: Date;
  tagGroupId: string;
  tagId: string;
  resetFilters: () => void;
}>((set) => ({
  from: startOfMonth(new Date()),
  to: new Date(),
  tagGroupId: '',
  tagId: '',
  resetFilters: () => {
    set({
      from: startOfMonth(new Date()),
      to: new Date(),
      tagGroupId: '',
      tagId: '',
    });
  },
}));

function filterProfiles(
  profiles: NonNullable<RouterOutputs['profile']['getByDateRange'][string]>,
  search: { tagId?: string; groupId?: string }
) {
  if (search.tagId === '' && search.groupId === '') return profiles;
  const mod = profiles.filter((profile) => {
    return (
      (search.tagId === '' ||
        profile.tags.some((tag) => tag.id === search.tagId)) &&
      (search.groupId === '' ||
        profile.tags.some((tag) => tag.groupId === search.groupId))
    );
  });
  return mod;
}

const PageClient = ({}: PageClientProps) => {
  const { from, to, tagId, tagGroupId, resetFilters } = useDashboardData(
    (s) => ({
      from: s.from,
      to: s.to,
      tagId: s.tagId,
      tagGroupId: s.tagGroupId,
      resetFilters: s.resetFilters,
    })
  );

  const [groupOpen, setGroupOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  const { data: tagGroupsData, isLoading: tagGroupsLoading } =
    trpc.tagGroup.getAll.useQuery();
  const { data: tagsData, isLoading: tagsLoading } = trpc.tag.getAll.useQuery();
  const { data: profilesData, isLoading: isLoadingProfiles } =
    trpc.profile.getByDateRange.useQuery({
      from: format(from, 'yyyy-MM-dd'),
      to: format(addDays(to, 1), 'yyyy-MM-dd'),
    });

  const currentGroup = useMemo(() => {
    if (!tagGroupsData) return;
    return tagGroupsData.find((group) => group.id === tagGroupId);
  }, [tagGroupsData, tagGroupId]);

  const currentTag = useMemo(() => {
    if (!tagsData) return;
    return tagsData.find((tag) => tag.id === tagId);
  }, [tagsData, tagId]);

  const tags = useMemo(() => {
    if (!currentGroup) return tagsData;
    return tagsData ? tagsData.filter((tag) => tag.groupId === tagGroupId) : [];
  }, [currentGroup, tagsData, tagGroupId]);

  const profilesForChart = useMemo(() => {
    const modReturn: { date: string; profiles: number }[] = [];
    if (!profilesData) return [];

    const range = eachDayOfInterval({ start: from, end: to }).map((d) =>
      formatDate(d, 'yyyy-MM-dd')
    );

    for (const day of range) {
      const profiles = profilesData[day];

      // if (!profiles) continue;
      const filteredProfiles = profiles
        ? filterProfiles(profiles, {
            tagId,
            groupId: tagGroupId,
          })
        : [];

      modReturn.push({ profiles: filteredProfiles.length, date: day });
    }
    return modReturn;
  }, [profilesData, from, to, tagId, tagGroupId]);

  const relevantProfiles = useMemo(() => {
    if (!profilesData) return [];
    const profs = Object.values(profilesData).flatMap((m) => {
      return m ?? [];
    });
    if (!profs) return [];
    if (!tagId && !tagGroupId) {
      return profs;
    }
    return filterProfiles(profs, { tagId, groupId: tagGroupId });
  }, [profilesData, tagId, tagGroupId]);

  return (
    <>
      <section className='grid-in-calendar'>
        <DateRangePicker
          align='start'
          value={{
            from,
            to,
          }}
          showCompare={false}
          initialDateFrom={from}
          initialDateTo={to}
          locale='es-AR'
          onUpdate={({ range }) => {
            useDashboardData.setState({
              from: range.from,
              to: range.to
                ? new Date(addDays(range.to, 1).getTime() - 1000)
                : new Date(addDays(new Date(), 1).getTime() - 1000),
            });
          }}
        />
      </section>
      <section className='w-full grid-in-grupo'>
        <ComboBox
          data={tagGroupsData ?? []}
          id='id'
          open={groupOpen}
          setOpen={setGroupOpen}
          onSelect={(value) => {
            if (value === tagGroupId) {
              useDashboardData.setState({ tagGroupId: '' });
            } else {
              useDashboardData.setState({ tagGroupId: value });
              useDashboardData.setState({ tagId: '' });
            }
            setGroupOpen(false);
          }}
          selectedIf={tagGroupId}
          value='name'
          triggerChildren={
            <>
              <span className='max-w-[calc(100%-30px)] truncate'>
                {tagGroupId ? currentGroup?.name : 'Buscar grupo...'}
              </span>
            </>
          }
          isLoading={tagGroupsLoading}
          wFullMobile
          buttonClassName='w-full sm:min-w-full h-[44px]'
          contentClassName='sm:max-w-[--radix-popper-anchor-width]'
        />
      </section>
      <section className='flex w-full items-center gap-x-2 self-start grid-in-etiqueta'>
        <ComboBox
          data={tags ?? []}
          id='id'
          open={tagOpen}
          setOpen={setTagOpen}
          onSelect={(value) => {
            if (value === tagId) {
              useDashboardData.setState({ tagId: '' });
            } else {
              useDashboardData.setState({ tagId: value });
            }
            setTagOpen(false);
          }}
          selectedIf={tagId ?? ''}
          value='name'
          triggerChildren={
            <>
              <span className='max-w-[calc(100%-30px)] truncate'>
                {tagId ? currentTag?.name : 'Buscar etiqueta...'}
              </span>
            </>
          }
          isLoading={tagsLoading}
          wFullMobile
          buttonClassName='w-full sm:min-w-[calc(100%-2rem)] h-[44px]'
          contentClassName='sm:max-w-[--radix-popper-anchor-width]'
        />
        <XIcon
          className='h-4 w-4 cursor-pointer'
          onClick={() => {
            resetFilters();
          }}
        />
      </section>
      <section className='rounded-md grid-in-grafico sm:h-full'>
        <ProfilesChartCard
          isLoading={isLoadingProfiles}
          profiles={profilesForChart}
        />
      </section>
      <section className='rounded-md grid-in-listaModelos sm:h-full sm:max-h-full'>
        <ProfilesList
          isLoading={isLoadingProfiles}
          profiles={relevantProfiles
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 20)}
        />
      </section>
      <section className='rounded-md grid-in-cardModelos sm:self-end sm:pb-2'>
        <SharedCard
          popoverText='Cantidad de participantes que cuentan con la etiqueta seleccionada'
          title='Participantes'
          content={relevantProfiles.length.toString()}
          isLoading={isLoadingProfiles}
        />
      </section>
      <section className='rounded-md grid-in-cardRetencion sm:self-end sm:pb-2'>
        <SharedCard
          popoverText='Porcentaje de participantes que aceptaron ser contactados'
          title='Retención de participantes'
          content={
            '0%'
            // isNaN(retencion)
            //   ? '0%'
            //   : retencion % 1 === 0
            //     ? `${retencion}%`
            //     : `${retencion.toFixed(2)}%`
          }
          isLoading={isLoadingProfiles}
        />
      </section>
      <section className='rounded-md pb-2 grid-in-cardMensajes sm:self-end'>
        <MensajesCard isLoading={isLoadingProfiles} cantMensajes={0} />
      </section>
    </>
  );
};

export default PageClient;
