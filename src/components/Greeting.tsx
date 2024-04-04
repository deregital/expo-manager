'use client';

import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { addDays, dateFormatYYYYMMDD } from '@/lib/utils';
import { useState } from 'react';

interface Props {
  process: string | undefined;
}

const Greeting = ({ process }: Props) => {
  console.log(process);

  const [dateRange, setDateRange] = useState<[string, string]>([
    dateFormatYYYYMMDD(new Date()),
    dateFormatYYYYMMDD(new Date()),
  ]);

  const [etiquetaId, setEtiquetaId] = useState<undefined | string>(undefined);

  const modelos = trpc.modelo.getByDateRange.useQuery({
    start: dateRange[0],
    end: addDays(dateRange[1], 1).toISOString(),
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

        <p>
          start: {new Date(dateRange[0]).toISOString()}, end:{' '}
          {addDays(dateRange[1], 1).toISOString()}
        </p>
        <pre>{JSON.stringify(modelos.data, null, 2)}</pre>
      </div>
    </>
  );
};

export default Greeting;
