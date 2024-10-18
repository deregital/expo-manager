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
    telefonoSecundario?: string;
    fechaNacimiento: Date | undefined;
    genero: string;
    etiquetas: NonNullable<RouterOutputs['tag']['getById']>[];
    apodos: string[];
    dni: string | undefined;
    mail: string | undefined;
    instagram: string | undefined;
    paisNacimiento: string | undefined;
    provinciaNacimiento: string | undefined;
    residencia:
      | {
          latitud?: number | undefined;
          longitud?: number | undefined;
          provincia: string | undefined;
          localidad: string | undefined;
        }
      | undefined;
  };
  resetModelo: () => void;
};

const defaultModelo = {
  nombreCompleto: '',
  telefono: '',
  telefonoSecundario: undefined,
  fechaNacimiento: undefined,
  genero: 'N/A',
  etiquetas: [],
  apodos: [],
  dni: undefined,
  mail: undefined,
  instagram: undefined,
  paisNacimiento: undefined,
  provinciaNacimiento: undefined,
  residencia: {
    latitud: undefined,
    longitud: undefined,
    provincia: undefined,
    localidad: undefined,
  },
};

export const useCrearModeloModal = create<ModeloModal>((set) => ({
  open: false,
  modelo: defaultModelo,
  resetModelo: () => set({ modelo: defaultModelo }),
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
