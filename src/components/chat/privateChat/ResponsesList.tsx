import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import IconQuestionAnswerLine from '@/components/icons/RespuestasEnlatadasIcon';
import CannedResponsesModal from '../CannedResponsesModal';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface ResponsesListProps {
  onSelect: (content: string) => void;
  isActive?: boolean;
}

const ResponsesList = ({ onSelect, isActive = false }: ResponsesListProps) => {
  const {
    data: responses,
    isLoading,
    error,
  } = trpc.cannedResponse.getAll.useQuery();
  const [search, setSearch] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const cannedResponsesFiltered = useMemo(() => {
    if (!responses) return [];
    if (!search) return responses;
    return responses.filter((response) =>
      response.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [responses, search]);

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
            cannedResponsesFiltered?.map((response) => (
              <li
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(response.content);
                  setPopoverOpen(false);
                }}
                key={response.id}
                className='flex cursor-pointer items-center justify-between px-2 py-2 hover:bg-gray-100'
              >
                <span>{response.name}</span>
                <CannedResponsesModal
                  action='EDIT'
                  cannedResponse={{
                    id: response.id,
                    name: response.name,
                    content: response.content,
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

export default ResponsesList;
