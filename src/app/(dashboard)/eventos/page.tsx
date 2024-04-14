'use client';
import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';

const EventPage = () => {
    const handleCreateEvent = () => {
      console.log('Crear nuevo evento');
    };
  
    return (
      <div style={{ marginTop: '20px', paddingLeft: '20px' }}>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 rounded-md bg-gray-400 px-5 py-0.5 text-gray-950 hover:bg-gray-300"
          type="button"
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls="radix-:r0:"
          data-state="closed"
          onClick={handleCreateEvent}
        >
          <span className="mr-3 h-5 w-5">
            <svg fill="currentColor" viewBox="0 0 24 24" height="1.5em" width="1.5em">
              <path d="M10 13H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1zm-1 6H5v-4h4zM20 3h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zm-1 6h-4V5h4zm1 7h-2v-2a1 1 0 00-2 0v2h-2a1 1 0 000 2h2v2a1 1 0 002 0v-2h2a1 1 0 000-2zM10 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zM9 9H5V5h4z"/>
            </svg>
          </span>
          Crear nuevo evento
        </button>
      </div>
    );
  };
  
  export default EventPage;