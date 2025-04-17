'use client';
import { type RouterOutputs } from '@/server';
import { format } from 'date-fns';
import React from 'react';
import EventModal from './modal/eventmodal';
import EventIcon from '../icons/EventIcon';
import GeneratePDFButton from '@/components/eventos/GeneratePDFButton';
import VerifiedIcon from '@/components/icons/VerifiedIcon';
import Link from 'next/link';

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
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='block w-full items-center justify-between gap-0.5 hover:no-underline sm:flex sm:items-stretch sm:gap-x-2'>
        <div className='flex gap-x-0.5'>
          {event.active && (
            <VerifiedIcon className='size-5 self-center fill-inherit' />
          )}
          <p className='whitespace-nowrap text-start'>{event.name}</p>
        </div>
        <div className='flex w-full items-center gap-x-1'>
          <p className='text-xs text-inherit opacity-70'>
            {format(event.startingDate, 'dd/MM/yyyy HH:mm')}
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
        <Link href={`/eventos/${event.id}`}>
          <EventIcon className='h-5 w-5 hover:text-black' />
        </Link>
        <EventModal action='EDIT' event={event} />
      </div>
    </div>
  );
};

export default EventListTrigger;
