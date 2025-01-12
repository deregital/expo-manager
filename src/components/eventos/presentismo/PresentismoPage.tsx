'use client';
import AsistenciaModal, {
  usePresentismoModal,
} from '@/components/eventos/AsistenciaModal';
import { generateColumnsPresentismo } from '@/components/eventos/table/columnsPresentismo';
import { DataTable } from '@/components/modelos/table/dataTable';
import SearchInput from '@/components/ui/SearchInput';
import Loader from '@/components/ui/loader';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { searchNormalize } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '@/hooks/eventos/presentismo/useProgress';
import GeneratePDFButton from '@/components/eventos/GeneratePDFButton';

interface PresentismoPageProps {
  eventId: string;
  baseUrl: string;
}

const PresentismoPage = ({ baseUrl, eventId }: PresentismoPageProps) => {
  const { data: event, isLoading: isLoadingEvent } =
    trpc.event.getById.useQuery(eventId);

  const { data: profiles, isLoading: isLoadingProfiles } =
    trpc.profile.getByTags.useQuery(
      event ? [event.tagConfirmedId, event.tagAssistedId] : [],
      {
        enabled: !!event,
      }
    );

  const modalPresentismo = usePresentismoModal();
  const searchParams = useSearchParams();
  const urlSearchParams = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );

  const [search, setSearch] = useState('');
  const router = useRouter();

  const profilesData = useMemo(() => {
    if (!profiles) return [];
    return profiles.filter((profile) => {
      if (profile.shortId !== null) {
        return (
          searchNormalize(profile.shortId.toString(), search) ||
          searchNormalize(profile.fullName, search)
        );
      }
      return searchNormalize(profile.fullName, search);
    });
  }, [search, profiles]);

  const profileCount = useMemo(() => {
    if (!profiles || !event) return 0;
    return profiles.filter((profile) =>
      profile.tags.find((tag) => tag.id === event.tagAssistedId)
    ).length;
  }, [event, profiles]);

  useEffect(() => {
    if (!event) return;
    usePresentismoModal.setState({ event: event });
  }, [event]);

  useEffect(() => {
    usePresentismoModal.setState({ isOpen: false });
    urlSearchParams.delete('persona');
    router.push(`/eventos/${eventId}/presentismo`);
  }, [eventId, router, urlSearchParams]);

  const progress = useProgress(profiles ?? [], event?.tagAssistedId ?? '');

  if (isLoadingEvent)
    return (
      <div className='flex items-center justify-center pt-5'>
        <Loader />
      </div>
    );

  return (
    <div>
      <div>
        <ArrowLeftIcon
          className='h-10 w-10 pt-3 hover:cursor-pointer'
          onClick={() => {
            router.replace(`/eventos/${eventId}`);
          }}
        />
      </div>
      <div className='flex items-center justify-center pb-3'>
        <h1 className='text-3xl font-extrabold'>Presentismo</h1>
      </div>
      <div className='grid auto-rows-auto grid-cols-2 items-center justify-center gap-x-3 pb-3 sm:flex'>
        <h3 className='col-span-2 p-2 text-center text-2xl font-semibold'>
          {event?.name}
        </h3>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {format(event!.date, 'yyyy-MM-dd')}
        </h3>
        <h3 className='p-2 text-center text-sm sm:text-base'>
          {event?.location}
        </h3>
      </div>
      <div className='flex flex-col items-center justify-around gap-x-5 pb-5 sm:flex-row'>
        <div className='w-[80%] pb-3 sm:w-[30%] sm:pb-0'>
          <h3 className='text-sm sm:text-lg'>Progreso: {progress}%</h3>
          <Progress value={progress} className='rounded-full bg-gray-300' />
        </div>
        <div>
          <h3 className='text-sm sm:text-lg'>
            Confirmaron: {profileCount}{' '}
            {profileCount === 1 ? 'participante' : 'participantes'}
          </h3>
        </div>
      </div>
      <div className='flex items-center justify-center gap-x-2 px-2 pb-5'>
        <SearchInput
          onChange={setSearch}
          placeholder='Buscar por nombre o ID legible'
        />
      </div>
      <DataTable
        columns={generateColumnsPresentismo({
          asistenciaId: event!.tagAssistedId,
          confirmoId: event!.tagConfirmedId,
        })}
        data={profilesData}
        isLoading={isLoadingProfiles}
        initialSortingColumn={{
          id: '¿Vino?' as keyof (typeof profilesData)[number],
          desc: false,
        }}
      />
      <div className='mt-5 flex h-fit items-center justify-end'>
        <AsistenciaModal open={modalPresentismo.isOpen} />
        <div className='m-5 flex justify-end'>
          <GeneratePDFButton
            baseUrl={baseUrl}
            event={{
              id: event!.id,
              name: event!.name,
              date: event!.date,
              location: event!.location,
              tagAssistedId: event!.tagAssistedId,
              tagConfirmedId: event!.tagConfirmedId,
            }}
            profilesData={profilesData}
          />
        </div>
      </div>
    </div>
  );
};

export default PresentismoPage;
