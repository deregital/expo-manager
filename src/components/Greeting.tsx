'use client';

import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import React, { useState } from 'react';

const dateFormat = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1 > 10 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`}-${date.getDate()}`;
};

const Greeting = () => {
  const [dateRange, setDateRange] = useState<[string, string]>([
    dateFormat(new Date()),
    dateFormat(new Date()),
  ]);

  const [etiquetaId, setEtiquetaId] = useState<undefined | string>(undefined);

  const modelos = trpc.modelo.getByDateRange.useQuery({
    start: dateRange[0],
    end: dateRange[1],
    etiquetaId: etiquetaId,
  });

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Input
          type='date'
          value={dateRange[0]}
          onChange={(e) => {
            setDateRange([e.currentTarget.value, dateRange[1]]);
          }}
        />

        <Input
          type='date'
          value={dateRange[1]}
          onChange={(e) => {
            setDateRange([dateRange[0], e.currentTarget.value]);
          }}
        />

        <Input
          type='text'
          value={etiquetaId}
          onChange={(e) => {
            if (e.currentTarget.value === '') {
              setEtiquetaId(undefined);
              return;
            }
            setEtiquetaId(e.currentTarget.value);
          }}
        />

        <pre>{JSON.stringify(modelos.data, null, 2)}</pre>
      </div>
    </>
  );
};

export default Greeting;
