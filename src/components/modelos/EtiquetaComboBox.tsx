'use client';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';

const EtiquetaComboBoxModelos = () => {
  const [open, setOpen] = useState(false);
  const searchParams = new URLSearchParams(useSearchParams());
  const [etiquetaId, setEtiquetaId] = useState(
    searchParams.get('etiqueta') ?? ''
  );
  const pathname = usePathname();
  const router = useRouter();
  const { data } =
    searchParams.get('grupoId') === null
      ? trpc.etiqueta.getAll.useQuery()
      : trpc.etiqueta.getByGrupoEtiqueta.useQuery(
          `${searchParams.get('grupoId')}`
        );
  useEffect(() => {
    setEtiquetaId(searchParams.get('etiqueta') ?? '');
  }, [searchParams.get('etiqueta')]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className='text-black' asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'
        >
          {etiquetaId
            ? data?.find((etiqueta) => etiqueta.id === etiquetaId)?.nombre
            : 'Buscar etiqueta...'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Buscar etiqueta...' className='h-9' />
          <CommandEmpty>Etiqueta no encontrado.</CommandEmpty>
          <CommandGroup>
            {data?.map((etiqueta) => (
              <CommandItem
                className='cursor-pointer hover:bg-gray-100'
                key={etiqueta.id}
                value={etiqueta.nombre}
                onSelect={() => {
                  setOpen(false);
                  if (etiqueta.id === etiquetaId) {
                    setEtiquetaId('');
                    searchParams.delete('etiqueta');
                  } else {
                    setEtiquetaId(etiqueta.id);
                    searchParams.set('etiqueta', etiqueta.id);
                  }
                  router.push(`${pathname}?${searchParams.toString()}`);
                }}
              >
                {etiqueta.nombre ? etiqueta.nombre : 'No hay nombre'}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    etiquetaId === etiqueta.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default EtiquetaComboBoxModelos;
