'use client';

import ModelosChart from '@/components/dashboard/ModelosChart';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
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
  const [nombreEvento, setNombreEvento] = useState('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [ubicacionEvento, setUbicacionEvento] = useState('');
  const [eventoPadreId, setEventoPadreId] = useState('');

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

  const { mutate: crearEvento } = trpc.evento.create.useMutation();


  const handleCrearEvento = async () => {
    try {
      await crearEvento({
        nombre: nombreEvento,
        fecha: fechaEvento,
        ubicacion: ubicacionEvento,
        eventoPadreId: eventoPadreId,
      });
      
      setNombreEvento('');
      setFechaEvento('');
      setUbicacionEvento('');
      setEventoPadreId('');
    } catch (error) {
      console.error('Error al crear el evento:', error);
    }
  };

  return (
    <>
      <div className='flex flex-col gap-4'>
        {}
        <Input
          type='text'
          value={nombreEvento}
          onChange={(e) => setNombreEvento(e.target.value)}
          placeholder='Nombre del evento'
        />
        {}
        <Input
          type='date'
          value={fechaEvento}
          onChange={(e) => setFechaEvento(e.target.value)}
          placeholder='Fecha del evento'
        />
        {}
        <Input
          type='text'
          value={ubicacionEvento}
          onChange={(e) => setUbicacionEvento(e.target.value)}
          placeholder='Ubicación del evento'
        />
        {}
        <Input
          type='text'
          value={eventoPadreId}
          onChange={(e) => setEventoPadreId(e.target.value)}
          placeholder='ID del evento padre (opcional)'
        />
        {}
        <button onClick={handleCrearEvento}>Crear Evento</button>
      </div>

      {}
    </>
  );
};

export default Greeting;