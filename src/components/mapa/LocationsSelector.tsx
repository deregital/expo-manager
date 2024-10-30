import { Input } from '@/components/ui/input';
import React from 'react';

interface LocationsSelectorProps {
  selectedLocation: 'residence' | 'birth' | 'none' | 'all';
  setSelectedLocation: React.Dispatch<
    React.SetStateAction<'residence' | 'birth' | 'none' | 'all'>
  >;
}

const LocationsSelector = ({
  setSelectedLocation,
  selectedLocation,
}: LocationsSelectorProps) => {
  return (
    <div className='w-full rounded-lg bg-white/80 p-4 backdrop-blur-lg'>
      <form
        className='space-y-4'
        onChange={(e) => {
          const value = (e.target as any).value as
            | 'residence'
            | 'birth'
            | 'none'
            | 'all';
          setSelectedLocation(value);
        }}
      >
        <div className='flex justify-between gap-x-4'>
          <span>Todos</span>
          <Input
            checked={selectedLocation === 'all'}
            type='radio'
            className='size-6'
            name='locations'
            value='all'
          />
        </div>
        <div className='flex justify-between gap-x-4'>
          <span>Nacimiento</span>
          <Input
            type='radio'
            className='size-6'
            name='locations'
            value='birth'
          />
        </div>
        <div className='flex justify-between gap-x-4'>
          <span>Residencia</span>
          <Input
            type='radio'
            className='size-6'
            name='locations'
            value='residence'
          />
        </div>
        <div className='flex justify-between gap-x-4'>
          <span>Ninguna</span>
          <Input
            type='radio'
            className='size-6'
            name='locations'
            value='none'
          />
        </div>
      </form>
    </div>
  );
};

export default LocationsSelector;
