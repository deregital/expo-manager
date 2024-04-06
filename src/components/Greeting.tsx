'use client';

import ModelosChart from '@/components/dashboard/ModelosChart';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { addDays, dateFormatYYYYMMDD } from '@/lib/utils';
import { useMemo, useState } from 'react';

function typedEntries<T extends Object>(obj: T) {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

const Greeting = () => {
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

  const dataModelos = useMemo(() => {
    return typedEntries(modelos.data ?? {}).map(([fecha, modelos]) => ({
      fecha,
      modelos: modelos.length,
    }));
  }, [modelos.data]);

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
      </div>

      <ModelosChart data={dataModelos} />
    </>
  );
};

export default Greeting;
