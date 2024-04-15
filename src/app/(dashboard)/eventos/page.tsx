'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

const EventPage = () => {
  const handleCreateEvent = () => {
    console.log('Crear nuevo evento');
  };

  return (
    <div className='p-3'>
      <Button
        className='bg-gray-400 text-gray-950  transition-colors hover:bg-gray-300'
        onClick={handleCreateEvent}
      >
        <span className='mr-3 h-5 w-5'>
          <svg
            fill='currentColor'
            viewBox='0 0 24 24'
            height='1.5em'
            width='1.5em'
          >
            <path d='M10 13H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1zm-1 6H5v-4h4zM20 3h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zm-1 6h-4V5h4zm1 7h-2v-2a1 1 0 00-2 0v2h-2a1 1 0 000 2h2v2a1 1 0 002 0v-2h2a1 1 0 000-2zM10 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zM9 9H5V5h4z' />
          </svg>
        </span>
        Crear nuevo evento
      </Button>
    </div>
  );
};

export default EventPage;
