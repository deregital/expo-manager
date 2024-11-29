import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import IconQuestionAnswerLine from '@/components/icons/RespuestasEnlatadasIcon';
import RespuestasEnlatadasModal from '../RespuestasEnlatadasModal';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface RespuestasListProps {
  onSelect: (descripcion: string) => void;
  isActive?: boolean;
}

const RespuestasList = ({
  onSelect,
  isActive = false,
}: RespuestasListProps) => {
  const {
    data: respuestas,
    isLoading,
    error,
  } = trpc.respuestasEnlatadas.getAll.useQuery();
  const [search, setSearch] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const cannedResponsesFiltered = useMemo(() => {
    if (!respuestas) return [];
    if (!search) return respuestas;
    return respuestas.filter((respuesta) =>
      respuesta.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [respuestas, search]);

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={(isOpen) => {
        setPopoverOpen(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          disabled={!isActive || isLoading || !!error}
          className='flex aspect-square items-center px-2 py-1 text-xs'
        >
          <IconQuestionAnswerLine className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='start'>
        <Input
          value={search}
          placeholder='Buscar respuesta enlatada'
          onChange={(e) => setSearch(e.target.value)}
          className='overflow-hidden rounded-b-none rounded-t-[inherit] border-x-0 border-t-0 bg-slate-100 focus-visible:ring-0'
        />
        <ul className='max-h-44 overflow-auto'>
          {cannedResponsesFiltered?.length === 0 ? (
            <li className='text-balance px-2 py-2 text-center text-gray-500'>
              No se encontraron respuestas enlatadas
            </li>
          ) : (
            cannedResponsesFiltered?.map((respuesta) => (
              <li
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(respuesta.descripcion);
                  setPopoverOpen(false);
                }}
                key={respuesta.id}
                className='flex cursor-pointer items-center justify-between px-2 py-2 hover:bg-gray-100'
              >
                <span>{respuesta.nombre}</span>
                <RespuestasEnlatadasModal
                  action='EDIT'
                  respuestaEnlatada={{
                    id: respuesta.id,
                    nombre: respuesta.nombre,
                    descripcion: respuesta.descripcion,
                  }}
                />
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default RespuestasList;
