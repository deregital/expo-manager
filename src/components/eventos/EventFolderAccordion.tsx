import EventFolderListTrigger from '@/components/eventos/EventFolderListTrigger';
import EventAccordion from '@/components/eventos/EventAccordion';
import { useExpandEventos } from '@/components/eventos/expandcontracteventos';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn, getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React, { useState } from 'react';

interface EventFolderAccordionProps {
  folder: RouterOutputs['event']['getAll']['folders'][number];
}

const EventFolderAccordion = ({ folder }: EventFolderAccordionProps) => {
  const [active, setActive] = useState<string[]>([]);
  const { clickTrigger } = useExpandEventos((s) => ({
    clickTrigger: s.clickTrigger,
  }));

  return (
    <AccordionItem
      value={folder.id}
      key={folder.id}
      title={folder.name}
      className='my-2 border-0'
    >
      <AccordionTrigger
        className={cn(
          'flex max-w-full justify-between gap-x-2 rounded-xl px-2 py-1.5',
          folder.events.length > 0 ? 'cursor-pointer' : 'cursor-default'
        )}
        showArrow={folder.events.length > 0}
        style={{
          backgroundColor: folder.color,
          color: getTextColorByBg(folder.color),
        }}
        onClick={() => {
          if (folder.events.length === 0) return;
          clickTrigger(folder.id);
        }}
      >
        <EventFolderListTrigger folder={folder} />
      </AccordionTrigger>
      <AccordionContent className='pb-0 pl-2'>
        <Accordion type='multiple' defaultValue={active} value={active}>
          {folder.events.map((event) => (
            <EventAccordion
              onClick={() => {
                if (active.includes(event.id)) {
                  setActive(active.filter((id) => id !== event.id));
                } else {
                  setActive([...active, event.id]);
                }
              }}
              color={folder.color}
              isOpen={active.includes(event.id)}
              key={event.id}
              event={event}
            />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};

export default EventFolderAccordion;
