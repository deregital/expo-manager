import EventListTrigger from '@/components/eventos/EventListTrigger';
import GeneratePDFButton from '@/components/eventos/GeneratePDFButton';
import { useExpandEventos } from '@/components/eventos/expandcontracteventos';
import EventIcon from '@/components/icons/EventIcon';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { trpc } from '@/lib/trpc';
import { cn, getTextColorByBg } from '@/lib/utils';
import { type RouterOutputs } from '@/server';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React from 'react';

interface EventAccordionProps {
  event: RouterOutputs['event']['getAll']['withoutFolder'][number];
  color?: string;
  onClick?: () => void;
  isOpen: boolean;
  baseUrl: string;
}

const EventAccordion = ({
  event,
  color,
  onClick,
  isOpen,
  baseUrl,
}: EventAccordionProps) => {
  const router = useRouter();
  const { clickTrigger } = useExpandEventos((s) => ({
    clickTrigger: s.clickTrigger,
  }));

  const { data: profilesData, isLoading: isLoadingProfiles } =
    trpc.profile.getByTags.useQuery(
      event ? [event.tagConfirmedId, event.tagAssistedId] : [],
      {
        enabled: !!event,
      }
    );

  const pdfIconColor = color ? getTextColorByBg(color) : '#FFFFFF';

  function redirectToEvent(subeventId: string) {
    router.push(`/eventos/${subeventId}`);
  }

  return (
    <AccordionItem
      value={event.id}
      key={event.id}
      title={event.name}
      className='my-2 border-0'
    >
      <AccordionTrigger
        className={cn(
          'flex max-w-full justify-between gap-x-2 rounded-xl px-2 py-1.5',
          event.subEvents.length > 0 ? 'cursor-pointer' : 'cursor-default',
          isOpen && 'rounded-br-none'
        )}
        showArrow={event.subEvents.length > 0}
        style={{
          backgroundColor: color ? `${color}80` : '#4B5563',
          color: color ? getTextColorByBg(color) : '#FFFFFF',
        }}
        onClick={() => {
          if (event.subEvents.length === 0) return;
          onClick ? onClick() : clickTrigger(event.id);
        }}
      >
        <EventListTrigger
          isLoadingProfiles={isLoadingProfiles}
          profilesData={profilesData ?? []}
          iconColor={pdfIconColor}
          event={event}
          baseUrl={baseUrl}
        />
      </AccordionTrigger>
      <AccordionContent className='pb-0 pl-2'>
        {event.subEvents.map((subevent) => {
          return (
            <div
              key={subevent.name}
              className='mb-1.5 ml-5 rounded-b-md p-2.5'
              style={{
                backgroundColor: color ? `${color}4b` : '#4B55634b',
              }}
            >
              <p className='font-semibold'>
                Nombre del subevento:{' '}
                <span className='font-normal'>{subevent.name}</span>
              </p>
              <p className='font-semibold'>
                Fecha del subevento:{' '}
                <span className='font-normal'>
                  {format(subevent.date, 'dd/MM/yyyy hh:mm')}
                </span>
              </p>
              <p className='font-semibold'>
                Ubicación del subevento:{' '}
                <span className='font-normal'>{subevent.location}</span>
              </p>
              <p className='flex gap-x-1 font-semibold'>
                Confirmación de asistencia al subevento:
                <EventIcon
                  className='h-5 w-5 hover:cursor-pointer hover:text-black/60'
                  onClick={(e) => {
                    e.stopPropagation();
                    redirectToEvent(subevent.id);
                  }}
                />
              </p>
              <p className='flex items-center gap-x-1 font-semibold'>
                PDF del Evento:
                <GeneratePDFButton
                  event={event}
                  disabled={isLoadingProfiles}
                  profilesData={profilesData ?? []}
                  baseUrl={baseUrl}
                  className='h-6 bg-transparent p-0 hover:bg-transparent hover:[&>svg]:scale-110'
                  style={{ color: '#000000' }}
                />
              </p>
            </div>
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
};

export default EventAccordion;
