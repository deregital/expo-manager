import { useExpandEventos } from '@/components/eventos/expandcontracteventos';
import { Accordion } from '@/components/ui/accordion';
import React, { useEffect } from 'react';
import { type RouterOutputs } from '@/server';
import EventAccordion from '@/components/eventos/EventAccordion';
import EventFolderAccordion from '@/components/eventos/EventFolderAccordion';

interface EventsListProps {
  events: RouterOutputs['event']['getAll'];
  baseUrl: string;
}

const EventsList: React.FC<EventsListProps> = ({ events, baseUrl }) => {
  const { state, active, setActive } = useExpandEventos((s) => ({
    state: s.state,
    setActive: s.setActive,
    active: s.active,
  }));

  const { folders, withoutFolder: eventsWithoutFolder } = events;

  useEffect(() => {
    if (state === 'EXPAND') {
      setActive(
        folders
          .map((folder) => folder.id)
          .concat(eventsWithoutFolder.map((event) => event.id))
          .concat(
            folders
              .flatMap((folder) =>
                folder.events.filter((e) => e.subEvents.length > 0)
              )
              .map((event) => event.id)
          )
      );
    } else if (state === 'NONE') {
      setActive(folders.map((folder) => folder.id));
    } else {
      setActive([]);
    }
  }, [folders, eventsWithoutFolder, setActive, state]);

  if (folders.length === 0 && eventsWithoutFolder.length === 0) {
    return (
      <div className='flex h-96 flex-col items-center justify-center gap-y-2'>
        <h3 className='text-xl text-slate-500'>No hay eventos</h3>
        <p className='text-sm text-slate-400'>
          Agrega nuevos eventos para comenzar
        </p>
      </div>
    );
  }

  return (
    <>
      <Accordion
        type='multiple'
        className='pt-4'
        defaultValue={active}
        value={active}
      >
        {folders.map((folder) => (
          <EventFolderAccordion
            baseUrl={baseUrl}
            key={folder.id}
            folder={folder}
          />
        ))}
        {eventsWithoutFolder.map((event) => (
          <EventAccordion
            baseUrl={baseUrl}
            isOpen={active.includes(event.id)}
            key={event.id}
            event={event}
          />
        ))}
      </Accordion>
    </>
  );
};

export default EventsList;
