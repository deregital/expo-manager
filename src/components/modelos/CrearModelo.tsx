'use client';
import { Button } from '../ui/button';
import { useState } from 'react';
import CrearModeloModal from './CrearModeloModal';

const CrearModelo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(!open)}>Crear Modelo</Button>
      <CrearModeloModal open={open} />
    </>
  );
};

export default CrearModelo;
