'use client';
import { Button } from '../ui/button';
import CrearModeloModal from './CrearModeloModal';
import { create } from 'zustand';

type ModeloModal = {
  open: boolean;
  modelo: {
    nombreCompleto: string;
    telefono: string;
    fechaNacimiento: Date | undefined;
    genero: string;
    etiquetas: string[];
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
  const modalModelo = useCrearModeloModal();
  return (
    <>
      <Button
        onClick={() =>
          useCrearModeloModal.setState({ open: !modalModelo.open })
        }
      >
        Crear Modelo
      </Button>
      <CrearModeloModal open={modalModelo.open} />
    </>
  );
};

export default CrearModelo;
