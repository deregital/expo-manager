'use client';

import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

const Greeting = () => {
  const [nombreEvento, setNombreEvento] = useState('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [ubicacionEvento, setUbicacionEvento] = useState('');

  const { mutate: crearEvento } = trpc.evento.create.useMutation();

  const handleCrearEvento = async () => {
    try {
      await crearEvento({
        nombre: nombreEvento,
        fecha: fechaEvento,
        ubicacion: ubicacionEvento,
        subeventos: [],
      });

      setNombreEvento('');
      setFechaEvento('');
      setUbicacionEvento('');
    } catch (error) {
      console.error('Error al crear el evento:', error);
    }
  };

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Input
          type='text'
          value={nombreEvento}
          onChange={(e) => setNombreEvento(e.target.value)}
          placeholder='Nombre del evento'
        />
        <Input
          type='date'
          value={fechaEvento}
          onChange={(e) => setFechaEvento(e.target.value)}
          placeholder='Fecha del evento'
        />
        <Input
          type='text'
          value={ubicacionEvento}
          onChange={(e) => setUbicacionEvento(e.target.value)}
          placeholder='Ubicación del evento'
        />
        <button onClick={handleCrearEvento}>Crear Evento</button>
      </div>
    </>
  );
};

export default Greeting;
