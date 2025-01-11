'use client';
import { type RouterOutputs } from '@/server';
import { format } from 'date-fns';
import React from 'react';
import EventModal from './eventmodal';
import EventIcon from '../icons/EventIcon';
import { useRouter } from 'next/navigation';
import GeneratePDFButton from '@/components/eventos/GeneratePDFButton';

interface EventListTriggerProps {
  event: RouterOutputs['event']['getAll']['withoutFolder'][number];
  baseUrl: string;
  iconColor?: string;
  profilesData: RouterOutputs['profile']['getByTags'];
  isLoadingProfiles: boolean;
}

const EventListTrigger = ({
  event,
  baseUrl,
  iconColor,
  profilesData,
  isLoadingProfiles,
}: EventListTriggerProps) => {
  const router = useRouter();

  function redirectToEvent() {
    router.push(`/eventos/${event.id}`);
  }

  return (
    <div className='flex w-full items-center justify-between'>
      <div className='block w-full justify-between gap-0.5 hover:no-underline sm:flex sm:items-stretch sm:gap-x-2'>
        <p className='whitespace-nowrap text-start'>{event.name}</p>

        <div className='flex w-full items-center gap-x-1'>
          <p className='text-xs text-inherit opacity-70'>
            {format(event.date, 'dd/MM/yyyy HH:mm')}
            {' - '}
            {event.location}
          </p>
        </div>
      </div>
      <div className='flex items-center justify-center gap-x-2'>
        <GeneratePDFButton
          event={event}
          profilesData={profilesData ?? []}
          baseUrl={baseUrl}
          disabled={isLoadingProfiles}
          className='h-6 bg-transparent fill-white p-0 hover:bg-transparent hover:[&>svg]:scale-110'
          style={{ color: iconColor }}
        />
        <EventIcon
          className='h-5 w-5 hover:text-black'
          onClick={(e) => {
            e.stopPropagation();
            redirectToEvent();
          }}
        />
        <EventModal action='EDIT' event={event} />
      </div>
    </div>
  );
};

export default EventListTrigger;
