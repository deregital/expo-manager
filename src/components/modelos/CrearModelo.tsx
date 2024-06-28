'use client';
import { RouterOutputs } from '@/server';
import { Button } from '../ui/button';
import CrearModeloModal from './CrearModeloModal';
import { create } from 'zustand';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type ModeloModal = {
  open: boolean;
  modelo: {
    nombreCompleto: string;
    telefono: string;
    fechaNacimiento: Date | undefined;
    genero: string;
    etiquetas: NonNullable<RouterOutputs['etiqueta']['getById']>[];
    apodos: string[];
    dni: string;
    mail: string;
    instagram: string;
  };
};

export const useCrearModeloModal = create<ModeloModal>(() => ({
  open: false,
  modelo: {
    nombreCompleto: '',
    telefono: '',
    fechaNacimiento: undefined,
    genero: 'N/A',
    etiquetas: [],
    apodos: [],
    dni: '',
    mail: '',
    instagram: '',
  },
}));

const CrearModelo = () => {
  // const modalModelo = useCrearModeloModal();
  const searchParams = new URLSearchParams(useSearchParams());
  const [search, setSearch] = useState(searchParams.get('modal') ?? '');

  useEffect(() => {
    setSearch(searchParams.get('modal') ?? '');
  }, [searchParams.get('modal')]);

  return (
    <>
      <Button
        className='mx-3 my-2 md:mx-5'
        onClick={() =>
          // useCrearModeloModal.setState({ open: !modalModelo.open })
          searchParams.set('modal', 'true')
        }
      >
        Crear Modelo
      </Button>
      <CrearModeloModal open={search === 'true' ? true : false} />
    </>
  );
};

export default CrearModelo;
