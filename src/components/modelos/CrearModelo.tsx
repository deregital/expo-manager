'use client';
import { RouterOutputs } from '@/server';
import { Button } from '../ui/button';
import CrearModeloModal from './CrearModeloModal';
import { create } from 'zustand';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
    paisNacimiento: string;
    provinciaNacimiento: string;
    residenciaLatitud: number | null;
    residenciaLongitud: number | null;
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
    paisNacimiento: '',
    provinciaNacimiento: '',
    residenciaLatitud: null,
    residenciaLongitud: null,
  },
}));

const CrearModelo = () => {
  // const modalModelo = useCrearModeloModal();
  const searchParams = new URLSearchParams(useSearchParams());
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get('modal') ?? '');

  useEffect(() => {
    setSearch(searchParams.get('modal') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('modal')]);

  return (
    <>
      <Button
        className='mx-3 mb-0 mt-3 md:mx-5'
        onClick={() => {
          searchParams.set('modal', 'true');
          router.push(`${pathname}?${searchParams.toString()}`);
        }}
      >
        Crear Participante
      </Button>
      <CrearModeloModal open={search === 'true' ? true : false} />
    </>
  );
};

export default CrearModelo;
