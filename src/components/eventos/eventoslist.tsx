import { useExpandEventos } from '@/components/eventos/expandcontracteventos';
import { Accordion } from '@/components/ui/accordion';
import React, { useEffect } from 'react';
import { RouterOutputs } from '@/server';
import EventoAccordion from '@/components/eventos/EventAccordion';
import EventFolderAccordion from '@/components/eventos/EventFolderAccordion';

interface EventosListProps {
  eventos: RouterOutputs['event']['getAll'];
}

const EventosList: React.FC<EventosListProps> = ({ eventos }) => {
  const { state, active, setActive } = useExpandEventos((s) => ({
    state: s.state,
    setActive: s.setActive,
    active: s.active,
  }));

  const { folders, withoutFolder } = eventos;

  useEffect(() => {
    if (state === 'EXPAND') {
      setActive(
        folders
          .map((folder) => folder.id)
          .concat(withoutFolder.map((event) => event.id))
      );
    } else if (state === 'NONE') {
      setActive(folders.map((folder) => folder.id));
    } else {
      setActive([]);
    }
  }, [folders, eventos, withoutFolder, setActive, state]);

  if (folders.length === 0 && withoutFolder.length === 0) {
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
          <EventFolderAccordion key={folder.id} folder={folder} />
        ))}
        {withoutFolder.map((event) => (
          <EventoAccordion
            isOpen={active.includes(event.id)}
            key={event.id}
            event={event}
          />
        ))}
      </Accordion>
    </>
  );
};

export default EventosList;
