import EventsFolderModal from '@/components/eventos/EventsFolderModal';
import FolderIcon from '@/components/icons/FolderIcon';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React from 'react';

interface EventFolderListTriggerProps {
  folder: RouterOutputs['evento']['getAll']['carpetas'][number];
}

const EventFolderListTrigger = ({ folder }: EventFolderListTriggerProps) => {
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex w-full items-center gap-0.5 hover:no-underline sm:gap-x-2'>
        <FolderIcon fill={getTextColorByBg(folder.color)} />
        <p className='whitespace-nowrap text-start'>{folder.nombre}</p>
      </div>
      <div className='flex items-center justify-center gap-x-2'>
        <EventsFolderModal action='EDIT' eventsFolder={folder} />
      </div>
    </div>
  );
};

export default EventFolderListTrigger;
