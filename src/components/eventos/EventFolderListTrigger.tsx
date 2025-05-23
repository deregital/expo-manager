import EventsFolderModal from '@/components/eventos/modal/EventsFolderModal';
import FolderIcon from '@/components/icons/FolderIcon';
import { getTextColorByBg } from '@/lib/utils';
import { type RouterOutputs } from '@/server';
import React from 'react';

interface EventFolderListTriggerProps {
  folder: RouterOutputs['event']['getAll']['folders'][number];
}

const EventFolderListTrigger = ({ folder }: EventFolderListTriggerProps) => {
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex w-full items-center gap-0.5 hover:no-underline sm:gap-x-2'>
        <FolderIcon fill={getTextColorByBg(folder.color)} />
        <p className='whitespace-nowrap text-start'>{folder.name}</p>
      </div>
      <div className='flex items-center justify-center gap-x-2'>
        <EventsFolderModal action='EDIT' eventsFolder={folder} />
      </div>
    </div>
  );
};

export default EventFolderListTrigger;
