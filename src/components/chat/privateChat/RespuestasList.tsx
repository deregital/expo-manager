import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import IconQuestionAnswerLine from '@/components/icons/RespuestasEnlatadasIcon';

interface RespuestasListProps {
  onSelect: (descripcion: string) => void;
}

const RespuestasList = ({ onSelect }: RespuestasListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: respuestas,
    isLoading,
    error,
  } = trpc.respuestasEnlatadas.getAll.useQuery();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar las respuestas enlatadas</div>;

  return (
    <div className='relative'>
      <Button
        className='flex items-center px-2 py-1 text-xs'
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        <IconQuestionAnswerLine className='mr-1 h-4 w-4' /> R.E.
      </Button>

      {isOpen && (
        <div className='absolute left-0 top-full z-20 mt-2 w-48 rounded-md bg-white shadow-lg'>
          <ul className='max-h-40 overflow-auto p-2'>
            {respuestas.map((respuesta) => (
              <li
                key={respuesta.id}
                className='cursor-pointer p-2 hover:bg-gray-100'
                onClick={() => {
                  onSelect(respuesta.descripcion);
                  setIsOpen(false);
                }}
              >
                {respuesta.nombre}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RespuestasList;
