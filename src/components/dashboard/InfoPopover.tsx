import InfoIcon from '@/components/icons/InfoIcon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import React, { useState } from 'react';

interface InfoPopoverProps {
  text: string;
}

const InfoPopover = ({ text }: InfoPopoverProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleMouseEnter = () => {
    setPopoverOpen(true);
  };

  const handleMouseLeave = () => {
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen}>
      <PopoverTrigger
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        asChild
      >
        <button type='button' className='hover:cursor-pointer'>
          <InfoIcon className='h-6 w-6' />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='mt-3 w-72 text-balance border-2 border-stone-300 bg-white px-5 text-center text-xs shadow-md shadow-black/50 xl:-top-full xl:left-10 xl:right-0 2xl:w-80'
        sideOffset={5}
      >
        <p>{text}</p>
      </PopoverContent>
    </Popover>
  );
};

export default InfoPopover;
