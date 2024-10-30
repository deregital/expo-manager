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
    birth: {
      country: string | undefined;
      state: string | undefined;
      longitude: number | undefined;
      latitude: number | undefined;
    };
    residence: {
      latitude: number | undefined;
      longitude: number | undefined;
      state: string | undefined;
      city: string | undefined;
    };
    comments: {
      content: string;
      isSolvable: boolean;
    }[];
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
  birth: {
    country: undefined,
    state: undefined,
    longitude: undefined,
    latitude: undefined,
  },
  residence: {
    latitude: undefined,
    longitude: undefined,
    state: undefined,
    city: undefined,
  },
  comments: [],
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
